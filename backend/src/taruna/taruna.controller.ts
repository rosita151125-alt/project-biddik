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
  Res,
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { TarunaService } from './taruna.service';
import { TarunaUploadService } from './taruna-upload.service';

@Controller('taruna')
export class TarunaController {
  constructor(
    private readonly tarunaService: TarunaService,
    private readonly tarunaUploadService: TarunaUploadService,
  ) {}

  @Get()
  async getAll() {
    return this.tarunaService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.tarunaService.getStats();
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.tarunaService.findOne(id);
  }

  @Get('nim/:nim')
  async getByNim(@Param('nim') nim: string) {
    return this.tarunaService.findByNim(nim);
  }

  @Get('upt/:uptCode')
  async getByUpt(@Param('uptCode') uptCode: string) {
    return this.tarunaService.findByUpt(uptCode);
  }

  @Post()
  async create(@Body() tarunaData: any, @Req() req: Request) {
    const user = (req as any).user;
    tarunaData.upt_code = user?.uptCode || 'UPT001';
    return this.tarunaService.create(tarunaData);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() tarunaData: any) {
    return this.tarunaService.update(id, tarunaData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.tarunaService.remove(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        ],
      }),
    )
    file: any,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const uptCode = user?.uptCode || 'UPT001';
    
    return this.tarunaUploadService.processExcel(file, uptCode);
  }

  @Get('template')
  async downloadTemplate(@Res() res: Response) {
    try {
      const buffer = await this.tarunaUploadService.generateTemplate();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=template_taruna.xlsx');
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        message: 'Error generating template',
        error: error.message
      });
    }
  }
}
