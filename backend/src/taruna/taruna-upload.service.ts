import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taruna } from './taruna.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class TarunaUploadService {
  constructor(
    @InjectRepository(Taruna)
    private tarunaRepository: Repository<Taruna>,
  ) {}

  async processExcel(file: any, uptCode: string = 'UPT001') {
    console.log(`Memproses upload file taruna: ${file.originalname}`);

    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('Hanya file Excel (.xlsx, .xls) yang diizinkan');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File terlalu besar. Maksimal 10MB');
    }

    try {
      const workbook = XLSX.read(file.buffer, { 
        type: 'buffer',
        cellDates: true,
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        blankrows: false,
        defval: ''
      });
      
      if (data.length < 2) {
        throw new BadRequestException('File Excel harus memiliki minimal 1 data (setelah header)');
      }

      const headers = data[0] as string[];
      const expectedHeaders = [
        'NIM', 'NAMA', 'TEMPAT_LAHIR', 'TANGGAL_LAHIR', 'JENIS_KELAMIN', 
        'AGAMA', 'ALAMAT', 'EMAIL', 'TELEPON', 'PROGRAM_STUDI', 
        'JURUSAN', 'TAHUN_MASUK', 'SEMESTER', 'STATUS'
      ];

      const headerValidation = this.validateHeaders(headers, expectedHeaders);
      if (!headerValidation.isValid) {
        throw new BadRequestException(
          `Format header Excel tidak sesuai. ${headerValidation.message}`
        );
      }

      const rows = data.slice(1);
      const results = {
        total: rows.length,
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as any[];
        const rowNumber = i + 2;
        
        if (this.isEmptyRow(row)) {
          console.log(`Baris ${rowNumber} kosong, dilewati`);
          continue;
        }

        try {
          const tarunaData = this.mapRowToTaruna(row, rowNumber, uptCode);
          await this.saveTaruna(tarunaData);
          results.success++;
          console.log(`Baris ${rowNumber} berhasil: ${tarunaData.nim} - ${tarunaData.nama}`);
        } catch (error) {
          results.failed++;
          results.errors.push(`Baris ${rowNumber}: ${error.message}`);
          console.error(`Baris ${rowNumber} gagal: ${error.message}`);
        }
      }

      if (results.success === 0 && results.failed > 0) {
        throw new BadRequestException({
          message: 'Semua data gagal diproses',
          errors: results.errors
        });
      }

      console.log(`Upload selesai: ${results.success} berhasil, ${results.failed} gagal`);
      
      return {
        message: `Upload berhasil: ${results.success} data diproses, ${results.failed} gagal`,
        summary: {
          total: results.total,
          success: results.success,
          failed: results.failed
        },
        errors: results.errors
      };
    } catch (error) {
      console.error(`Error processing file: ${error.message}`);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `Terjadi kesalahan saat memproses file: ${error.message}`
      );
    }
  }

  private validateHeaders(headers: string[], expected: string[]): { isValid: boolean; message: string } {
    if (!headers || headers.length === 0) {
      return { isValid: false, message: 'Header tidak ditemukan' };
    }

    const normalizedHeaders = headers.map(h => h.toString().toUpperCase().trim());
    const normalizedExpected = expected.map(e => e.toUpperCase().trim());

    const missingHeaders = normalizedExpected.filter(expectedHeader => 
      !normalizedHeaders.some(header => header.includes(expectedHeader))
    );

    if (missingHeaders.length > 0) {
      return { 
        isValid: false, 
        message: `Kolom yang diperlukan: ${missingHeaders.join(', ')}` 
      };
    }

    return { isValid: true, message: 'Header valid' };
  }

  private isEmptyRow(row: any[]): boolean {
    if (!row || row.length === 0) return true;
    return row.every(cell => 
      cell === null || 
      cell === undefined || 
      cell === '' || 
      (typeof cell === 'string' && cell.trim() === '')
    );
  }

  private mapRowToTaruna(row: any[], rowNumber: number, uptCode: string): Partial<Taruna> {
    if (!row[0] || row[0].toString().trim() === '') {
      throw new Error('NIM wajib diisi');
    }
    
    if (!row[1] || row[1].toString().trim() === '') {
      throw new Error('Nama wajib diisi');
    }
    
    if (!row[7] || row[7].toString().trim() === '') {
      throw new Error('Email wajib diisi');
    }

    const nim = row[0].toString().trim();
    const nama = row[1].toString().trim();
    const email = row[7].toString().trim();

    // Validasi format NIM
    if (!/^\d{8,}$/.test(nim.replace(/\D/g, ''))) {
      throw new Error('Format NIM tidak valid (minimal 8 digit angka)');
    }

    // Validasi format email
    if (!this.isValidEmail(email)) {
      throw new Error('Format email tidak valid');
    }

    const taruna: Partial<Taruna> = {
      nim: nim,
      nama: nama,
      tempat_lahir: row[2] ? row[2].toString().trim() : '',
      tanggal_lahir: row[3] ? new Date(row[3]) : null,
      jenis_kelamin: this.validateJenisKelamin(row[4] ? row[4].toString().trim() : ''),
      agama: row[5] ? row[5].toString().trim() : '',
      alamat: row[6] ? row[6].toString().trim() : '',
      email: email,
      telepon: row[8] ? row[8].toString().trim() : '',
      program_studi: row[9] ? row[9].toString().trim() : '',
      jurusan: row[10] ? row[10].toString().trim() : '',
      tahun_masuk: row[11] ? parseInt(row[11]) : new Date().getFullYear(),
      semester: row[12] ? parseInt(row[12]) : 1,
      status: this.validateStatus(row[13] ? row[13].toString().trim() : ''),
      upt_code: uptCode,
    };

    return taruna;
  }

  private validateJenisKelamin(jk: string): string {
    const normalized = jk.toUpperCase().trim();
    if (normalized === 'L' || normalized === 'LAKI-LAKI') return 'L';
    if (normalized === 'P' || normalized === 'PEREMPUAN') return 'P';
    return 'L'; // Default
  }

  private validateStatus(status: string): string {
    const validStatus = ['AKTIF', 'CUTI', 'DROP_OUT', 'LULUS'];
    const normalized = status.toUpperCase().trim();
    
    if (!normalized || !validStatus.includes(normalized)) {
      return 'AKTIF';
    }
    return normalized;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async saveTaruna(tarunaData: Partial<Taruna>): Promise<void> {
    const existingTaruna = await this.tarunaRepository.findOne({
      where: { nim: tarunaData.nim }
    });

    if (existingTaruna) {
      await this.tarunaRepository.update(existingTaruna.id, tarunaData);
    } else {
      const taruna = this.tarunaRepository.create(tarunaData);
      await this.tarunaRepository.save(taruna);
    }
  }

  async generateTemplate(): Promise<Buffer> {
    const allTaruna = await this.tarunaRepository.find({
      order: { id: 'DESC' }
    });

    const templateData = [
      ['NIM', 'NAMA', 'TEMPAT_LAHIR', 'TANGGAL_LAHIR', 'JENIS_KELAMIN', 'AGAMA', 'ALAMAT', 'EMAIL', 'TELEPON', 'PROGRAM_STUDI', 'JURUSAN', 'TAHUN_MASUK', 'SEMESTER', 'STATUS'],
    ];

    if (allTaruna.length > 0) {
      allTaruna.forEach(taruna => {
        templateData.push([
          taruna.nim,
          taruna.nama,
          taruna.tempat_lahir || '',
          taruna.tanggal_lahir ? this.formatDate(taruna.tanggal_lahir) : '',
          taruna.jenis_kelamin || 'L',
          taruna.agama || '',
          taruna.alamat || '',
          taruna.email,
          taruna.telepon || '',
          taruna.program_studi,
          taruna.jurusan,
          taruna.tahun_masuk.toString(),
          taruna.semester.toString(),
          taruna.status,
        ]);
      });
    } else {
      templateData.push(
        ['202301001', 'Ahmad Wijaya', 'Jakarta', '2000-05-15', 'L', 'Islam', 'Jl. Merdeka No. 123', 'ahmad.wijaya@kampus.ac.id', '08123456789', 'Teknik Informatika', 'Teknik', '2023', '3', 'AKTIF'],
        ['202301002', 'Siti Rahmawati', 'Bandung', '2001-08-20', 'P', 'Islam', 'Jl. Asia Afrika No. 45', 'siti.rahmawati@kampus.ac.id', '08129876543', 'Sistem Informasi', 'Teknik', '2023', '3', 'AKTIF']
      );
    }

    templateData.push(
      [],
      ['CATATAN PENGISIAN:'],
      ['- NIM, NAMA, EMAIL wajib diisi'],
      ['- NIM minimal 8 digit angka'],
      ['- JENIS_KELAMIN: L atau P'],
      ['- TANGGAL_LAHIR: YYYY-MM-DD (2000-05-15)'],
      ['- STATUS: AKTIF, CUTI, DROP_OUT, LULUS'],
      ['- Data di atas adalah data existing, bisa dihapus atau diedit']
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    
    const colWidths = [
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }
    ];
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Taruna');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
