import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dosen } from './dosen.entity';

@Injectable()
export class DosenService {
  constructor(
    @InjectRepository(Dosen)
    private dosenRepository: Repository<Dosen>,
  ) {}

  async findAll(): Promise<Dosen[]> {
    return this.dosenRepository.find();
  }

  async findOne(id: number): Promise<Dosen> {
    const dosen = await this.dosenRepository.findOne({ where: { id } });
    if (!dosen) {
      throw new NotFoundException(`Dosen dengan ID ${id} tidak ditemukan`);
    }
    return dosen;
  }

  async findByNip(nip: string): Promise<Dosen> {
    const dosen = await this.dosenRepository.findOne({ where: { nip } });
    if (!dosen) {
      throw new NotFoundException(`Dosen dengan NIP ${nip} tidak ditemukan`);
    }
    return dosen;
  }

  async findByUpt(uptCode: string): Promise<Dosen[]> {
    return this.dosenRepository.find({ where: { uptCode } });
  }

  async create(dosenData: Partial<Dosen>): Promise<Dosen> {
    const dosen = this.dosenRepository.create(dosenData);
    return this.dosenRepository.save(dosen);
  }

  async update(id: number, dosenData: Partial<Dosen>): Promise<Dosen> {
    await this.dosenRepository.update(id, dosenData);
    return this.findOne(id);
  }

  // ✅ TAMBAHKAN METHOD DELETE
  async remove(id: number): Promise<void> {
    const result = await this.dosenRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Dosen dengan ID ${id} tidak ditemukan`);
    }
  }

  // ✅ METHOD GET STATS
  async getStats(): Promise<any> {
    const total = await this.dosenRepository.count();
    
    const byStatus = await this.dosenRepository
      .createQueryBuilder('dosen')
      .select('dosen.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('dosen.status')
      .getRawMany();

    const byPendidikan = await this.dosenRepository
      .createQueryBuilder('dosen')
      .select('dosen.pendidikanTerakhir', 'pendidikanTerakhir')
      .addSelect('COUNT(*)', 'count')
      .groupBy('dosen.pendidikanTerakhir')
      .getRawMany();

    return {
      total,
      byStatus,
      byPendidikan,
    };
  }
}
