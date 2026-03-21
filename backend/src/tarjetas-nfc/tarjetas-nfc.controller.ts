import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TarjetasNfcService } from './tarjetas-nfc.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tarjetas-nfc')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('administrador')
export class TarjetasNfcController {
  constructor(private readonly tarjetasNfcService: TarjetasNfcService) {}

  @Get()
  findAll() {
    return this.tarjetasNfcService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tarjetasNfcService.findOne(id);
  }

  @Post()
  create(@Body() body: { codigoNfc: string; empleadoId: number }) {
    return this.tarjetasNfcService.create(body.codigoNfc, body.empleadoId);
  }

  @Patch(':id/toggle')
  toggleActiva(@Param('id', ParseIntPipe) id: number) {
    return this.tarjetasNfcService.toggleActiva(id);
  }

  @Patch(':id/reasignar')
  reasignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { codigoNfc: string },
  ) {
    return this.tarjetasNfcService.reasignar(id, body.codigoNfc);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.tarjetasNfcService.delete(id);
  }
}
