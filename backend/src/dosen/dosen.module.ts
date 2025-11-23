import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DosenController } from './dosen.controller';
import { DosenService } from './dosen.service';
import { DosenUploadService } from './dosen-upload.service';
import { Dosen } from './dosen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dosen])],
  controllers: [DosenController],
  providers: [DosenService, DosenUploadService], // ✅ HAPUS DUPLIKAT
  exports: [DosenService],
})
export class DosenModule {}
