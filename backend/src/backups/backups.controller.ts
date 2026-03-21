import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  UseGuards,
  Request,
  Body,
  ParseIntPipe,
  StreamableFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BackupsService } from './backups.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('backups')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Post()
  @Roles('administrador')
  create(@Request() req, @Body('comentario') comentario: string) {
    return this.backupsService.createBackup(req.user.id, comentario);
  }

  @Get()
  @Roles('administrador')
  findAll() {
    return this.backupsService.findAll();
  }

  @Get('descargar/:id')
  @Roles('administrador')
  async download(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res: Response) {
    const filePath = await this.backupsService.getDownloadPath(id);
    const fileName = filePath.split('\\').pop();
    
    res.set({
      'Content-Type': 'application/sql',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.backupsService.remove(id);
  }
}
