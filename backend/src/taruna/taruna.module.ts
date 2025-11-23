import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarunaController } from './taruna.controller';
import { TarunaService } from './taruna.service';
import { TarunaUploadService } from './taruna-upload.service';
import { Taruna } from './taruna.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Taruna]) // ✅ INI YANG MEMBUAT TarunaRepository AVAILABLE
  ],
  controllers: [TarunaController],
  providers: [TarunaService, TarunaUploadService],
  exports: [TarunaService],
})
export class TarunaModule {}
