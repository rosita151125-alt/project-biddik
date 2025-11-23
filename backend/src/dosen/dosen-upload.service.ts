import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dosen } from './dosen.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class DosenUploadService {
  constructor(
    @InjectRepository(Dosen)
    private dosenRepository: Repository<Dosen>,
  ) {}

  async processExcel(file: any, uptCode: string = 'UPT001') {
    console.log(`Memproses upload file: ${file.originalname}`);

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
        'NIP', 'NIDN', 'NAMA', 'GELAR_DEPAN', 'GELAR_BELAKANG', 
        'JURUSAN', 'PROGRAM_STUDI', 'JABATAN', 'PENDIDIKAN_TERAKHIR', 
        'STATUS', 'EMAIL', 'TELEPON'
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
          const dosenData = this.mapRowToDosen(row, rowNumber, uptCode);
          await this.saveDosen(dosenData);
          results.success++;
          console.log(`Baris ${rowNumber} berhasil: ${dosenData.nip} - ${dosenData.nama}`);
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

  private mapRowToDosen(row: any[], rowNumber: number, uptCode: string): Partial<Dosen> {
    if (!row[0] || row[0].toString().trim() === '') {
      throw new Error('NIP wajib diisi');
    }
    
    if (!row[2] || row[2].toString().trim() === '') {
      throw new Error('Nama wajib diisi');
    }
    
    if (!row[10] || row[10].toString().trim() === '') {
      throw new Error('Email wajib diisi');
    }

    const nip = row[0].toString().trim();
    const nidn = row[1] ? row[1].toString().trim() : null;
    const nama = row[2].toString().trim();
    const email = row[10].toString().trim();

    if (!/^\d{5,}$/.test(nip.replace(/\D/g, ''))) {
      throw new Error('Format NIP tidak valid (minimal 5 digit angka)');
    }

    if (nidn && !/^\d{10}$/.test(nidn)) {
      throw new Error('Format NIDN tidak valid (harus 10 digit angka)');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Format email tidak valid');
    }

    const dosen: Partial<Dosen> = {
      nip: nip,
      nidn: nidn,
      nama: nama,
      gelarDepan: row[3] ? row[3].toString().trim() : '',
      gelarBelakang: row[4] ? row[4].toString().trim() : '',
      jurusan: row[5] ? row[5].toString().trim() : '',
      programStudi: row[6] ? row[6].toString().trim() : '',
      jabatan: row[7] ? row[7].toString().trim() : 'Lektor',
      pendidikanTerakhir: this.validatePendidikan(row[8] ? row[8].toString().trim() : ''),
      status: this.validateStatus(row[9] ? row[9].toString().trim() : ''),
      email: email,
      telepon: row[11] ? row[11].toString().trim() : '',
      uptCode: uptCode,
    };

    return dosen;
  }

  private validatePendidikan(pendidikan: string): string {
    const validPendidikan = ['S1', 'S2', 'S3'];
    const normalized = pendidikan.toUpperCase().trim();
    
    if (!normalized || !validPendidikan.includes(normalized)) {
      return 'S1';
    }
    return normalized;
  }

  private validateStatus(status: string): string {
    const validStatus = ['AKTIF', 'CUTI', 'PENSION', 'PENSIUN'];
    const normalized = status.toUpperCase().trim();
    
    if (!normalized || !validStatus.includes(normalized)) {
      return 'AKTIF';
    }
    
    return normalized === 'PENSIUN' ? 'PENSION' : normalized;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async saveDosen(dosenData: Partial<Dosen>): Promise<void> {
    const existingDosen = await this.dosenRepository.findOne({
      where: { nip: dosenData.nip }
    });

    if (existingDosen) {
      await this.dosenRepository.update(existingDosen.id, dosenData);
    } else {
      const dosen = this.dosenRepository.create(dosenData);
      await this.dosenRepository.save(dosen);
    }
  }

  // Method untuk download template - FIXED VERSION
  async generateTemplate(): Promise<Buffer> {
    // AMBIL SEMUA DATA DARI DATABASE
    const allDosen = await this.dosenRepository.find({
      order: { id: 'DESC' } // Data terbaru di atas
    });

    const templateData = [
      ['NIP', 'NIDN', 'NAMA', 'GELAR_DEPAN', 'GELAR_BELAKANG', 'JURUSAN', 'PROGRAM_STUDI', 'JABATAN', 'PENDIDIKAN_TERAKHIR', 'STATUS', 'EMAIL', 'TELEPON'],
    ];

    // TAMPILKAN SEMUA DATA YANG ADA DI DATABASE
    if (allDosen.length > 0) {
      allDosen.forEach(dosen => {
        templateData.push([
          dosen.nip,
          dosen.nidn || '',
          dosen.nama,
          dosen.gelarDepan || '',
          dosen.gelarBelakang || '',
          dosen.jurusan || '',
          dosen.programStudi || '',
          dosen.jabatan || '',
          dosen.pendidikanTerakhir || '',
          dosen.status || '',
          dosen.email || '',
          dosen.telepon || '',
        ]);
      });
    } else {
      // JIKA TIDAK ADA DATA, PAKAI DATA CONTOH
      templateData.push(
        ['19801215200501001', '0001127301', 'Ahmad Santoso', 'Dr.', 'M.Kom.', 'Teknik Informatika', 'S1 Teknik Informatika', 'Lektor', 'S3', 'AKTIF', 'ahmad.santoso@kampus.ac.id', '08123456789'],
        ['197507102000031002', '0025077501', 'Siti Rahayu', 'Dra.', 'M.Si.', 'Sistem Informasi', 'S1 Sistem Informasi', 'Lektor Kepala', 'S2', 'AKTIF', 'siti.rahayu@kampus.ac.id', '08129876543']
      );
    }

    // TAMBAH INSTRUKSI
    templateData.push(
      [], // Empty row
      ['CATATAN PENGISIAN:'],
      ['- NIP, NAMA, EMAIL wajib diisi'],
      ['- NIP minimal 5 digit angka'],
      ['- NIDN harus 10 digit angka (jika ada)'],
      ['- PENDIDIKAN: S1, S2, atau S3'],
      ['- STATUS: AKTIF, CUTI, atau PENSION'],
      ['- Data di atas adalah data existing, bisa dihapus atau diedit']
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 12 },
      { wch: 25 }, { wch: 15 }
    ];
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Dosen');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}
