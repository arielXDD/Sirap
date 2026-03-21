import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NfcReaderService } from './nfc-reader.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('nfc')
export class NfcController {
  constructor(private readonly nfcService: NfcReaderService) {}

  @Get('estado')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('administrador', 'supervisor')
  getEstado() {
    return this.nfcService.getEstadoConexion();
  }

  @Post('lectura')
  lectura(@Body('codigoNfc') codigoNfc: string) {
    return this.nfcService.procesarLecturaNfc(codigoNfc);
  }
}
