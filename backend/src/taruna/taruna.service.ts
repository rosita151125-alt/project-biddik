// taruna.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class TarunaService {
  
  private tarunaData = [
    {
      id: 1,
      nim: '20220001',
      nama: 'Ahmad Rizki',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '2000-05-15',
      jenis_kelamin: 'L',
      agama: 'Islam',
      alamat: 'Jl. Merdeka No. 123, Jakarta Pusat',
      email: 'ahmad.rizki@kampus.ac.id',
      telepon: '08123456789',
      program_studi: 'S1',
      jurusan: 'Teknik Informatika',
      tahun_masuk: 2022,
      semester: 6,
      status: 'AKTIF',
      upt_code: 'UPT001',
      created_at: new Date('2022-08-01'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: 2,
      nim: '20220002',
      nama: 'Siti Aminah',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '2001-08-20',
      jenis_kelamin: 'P',
      agama: 'Islam',
      alamat: 'Jl. Asia Afrika No. 45, Bandung',
      email: 'siti.aminah@kampus.ac.id',
      telepon: '08129876543',
      program_studi: 'S1',
      jurusan: 'Sistem Informasi',
      tahun_masuk: 2022,
      semester: 6,
      status: 'AKTIF',
      upt_code: 'UPT001',
      created_at: new Date('2022-08-01'),
      updated_at: new Date('2024-01-10')
    },
    {
      id: 3,
      nim: '20230001',
      nama: 'Budi Santoso',
      tempat_lahir: 'Surabaya',
      tanggal_lahir: '2002-03-10',
      jenis_kelamin: 'L',
      agama: 'Kristen',
      alamat: 'Jl. Pahlawan No. 67, Surabaya',
      email: 'budi.santoso@kampus.ac.id',
      telepon: '082112345678',
      program_studi: 'S1',
      jurusan: 'Teknik Elektro',
      tahun_masuk: 2023,
      semester: 4,
      status: 'AKTIF',
      upt_code: 'UPT002',
      created_at: new Date('2023-08-01'),
      updated_at: new Date('2024-01-12')
    },
    {
      id: 4,
      nim: '20220015',
      nama: 'Maria Magdalena',
      tempat_lahir: 'Yogyakarta',
      tanggal_lahir: '2000-12-25',
      jenis_kelamin: 'P',
      agama: 'Katolik',
      alamat: 'Jl. Malioboro No. 88, Yogyakarta',
      email: 'maria.magda@kampus.ac.id',
      telepon: '085678901234',
      program_studi: 'S1',
      jurusan: 'Manajemen',
      tahun_masuk: 2022,
      semester: 6,
      status: 'CUTI',
      upt_code: 'UPT003',
      created_at: new Date('2022-08-01'),
      updated_at: new Date('2024-01-05')
    },
    {
      id: 5,
      nim: '20210010',
      nama: 'Joko Widodo',
      tempat_lahir: 'Solo',
      tanggal_lahir: '1999-11-28',
      jenis_kelamin: 'L',
      agama: 'Islam',
      alamat: 'Jl. Slamet Riyadi No. 12, Solo',
      email: 'joko.widodo@kampus.ac.id',
      telepon: '087812345678',
      program_studi: 'S1',
      jurusan: 'Akuntansi',
      tahun_masuk: 2021,
      semester: 8,
      status: 'AKTIF',
      upt_code: 'UPT002',
      created_at: new Date('2021-08-01'),
      updated_at: new Date('2024-01-08')
    }
  ];

  async findAll(): Promise<any[]> {
    console.log('🔧 TarunaService.findAll() called - RETURNING SAMPLE DATA');
    return this.tarunaData;
  }

  async findOne(id: number): Promise<any> {
    return this.tarunaData.find(taruna => taruna.id === id);
  }

  async findByNim(nim: string): Promise<any> {
    return this.tarunaData.find(taruna => taruna.nim === nim);
  }

  async findByUpt(uptCode: string): Promise<any[]> {
    return this.tarunaData.filter(taruna => taruna.upt_code === uptCode);
  }

  async create(tarunaData: any): Promise<any> {
    const newId = Math.max(...this.tarunaData.map(t => t.id)) + 1;
    const newTaruna = {
      id: newId,
      ...tarunaData,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.tarunaData.push(newTaruna);
    return newTaruna;
  }

  async update(id: number, tarunaData: any): Promise<any> {
    const index = this.tarunaData.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tarunaData[index] = {
        ...this.tarunaData[index],
        ...tarunaData,
        updated_at: new Date()
      };
      return this.tarunaData[index];
    }
    return null;
  }

  async remove(id: number): Promise<void> {
    const index = this.tarunaData.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tarunaData.splice(index, 1);
    }
  }

  async getStats(): Promise<any> {
    const total = this.tarunaData.length;
    const byStatus = this.tarunaData.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    
    const byProgramStudi = this.tarunaData.reduce((acc, curr) => {
      acc[curr.program_studi] = (acc[curr.program_studi] || 0) + 1;
      return acc;
    }, {});

    const byJurusan = this.tarunaData.reduce((acc, curr) => {
      acc[curr.jurusan] = (acc[curr.jurusan] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      byStatus,
      byProgramStudi,
      byJurusan,
      byUpt: this.tarunaData.reduce((acc, curr) => {
        acc[curr.upt_code] = (acc[curr.upt_code] || 0) + 1;
        return acc;
      }, {})
    };
  }
}
