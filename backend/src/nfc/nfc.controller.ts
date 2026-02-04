import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NfcReaderService } from './nfc-reader.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('nfc')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NfcController {
  constructor(private readonly nfcService: NfcReaderService) {}

  @Get('estado')
  @Roles('administrador', 'supervisor')
  getEstado() {
    return this.nfcService.getEstadoConexion();
  }
}
