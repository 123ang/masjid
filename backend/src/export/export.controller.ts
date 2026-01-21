import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { createReadStream } from 'fs';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('excel')
  async exportExcel(@Request() req, @Res() res: Response) {
    const filePath = await this.exportService.exportToExcel(req.user.masjidId);

    res.download(filePath, 'senarai-isi-rumah.xlsx', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Cleanup file after download
      setTimeout(() => {
        this.exportService.cleanupFile(filePath);
      }, 1000);
    });
  }

  @Get('csv')
  async exportCSV(@Request() req, @Res() res: Response) {
    const filePath = await this.exportService.exportToCSV(req.user.masjidId);

    res.download(filePath, 'senarai-isi-rumah.csv', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Cleanup file after download
      setTimeout(() => {
        this.exportService.cleanupFile(filePath);
      }, 1000);
    });
  }
}
