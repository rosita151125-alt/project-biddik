import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  UseInterceptors, 
  UploadedFile, 
  ParseFilePipe, 
  MaxFileSizeValidator,
  Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DosenService } from './dosen.service';
import { DosenUploadService } from './dosen-upload.service';

@Controller('dosen')
// ✅ HAPUS SEMUA GUARD & IMPORT AUTH
export class DosenController {
  constructor(
    private readonly dosenService: DosenService,
    private readonly dosenUploadService: DosenUploadService,
  ) {}

  // ✅ ENDPOINT UPLOAD EXCEL TANPA AUTH
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: any,
  ) {
    return this.dosenUploadService.processExcel(file, 'UPT001');
  }

  // ✅ ENDPOINT DOWNLOAD TEMPLATE TANPA AUTH
  @Get('template')
  async downloadTemplate(@Res() res: Response) {
    try {
      const buffer = await this.dosenUploadService.generateTemplate();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=template_dosen.xlsx');
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        message: 'Error generating template',
        error: error.message
      });
    }
  }

  // ... existing endpoints (TANPA GUARD) ...
  @Get()
  async getAll() {
    return this.dosenService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.dosenService.getStats();
  }

  @Post()
  async create(@Body() dosenData: any) {
    return this.dosenService.create(dosenData);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dosenData: any) {
    return this.dosenService.update(id, dosenData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) { 
    return this.dosenService.remove(id);
  }
}
