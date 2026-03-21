import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('asistencias')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Post('registrar/:empleadoId')
  @Roles('administrador', 'supervisor')
  registrar(@Param('empleadoId', ParseIntPipe) empleadoId: number) {
    return this.asistenciasService.registrarAsistencia(empleadoId, 'manual');
  }

  @Get('stats/hoy')
  @Roles('administrador', 'supervisor')
  getStatsHoy() {
    return this.asistenciasService.getStatsHoy();
  }

  @Get('stats/graficas')
  @Roles('administrador', 'supervisor')
  getStatsGraficas() {
    return this.asistenciasService.getStatsGraficas();
  }

  @Post('manual')
  @Roles('administrador', 'supervisor')
  createManual(@Body() createAsistenciaDto: CreateAsistenciaDto) {
    return this.asistenciasService.createManual(createAsistenciaDto);
  }

  @Get('empleado/:id')
  @Roles('administrador', 'supervisor', 'empleado')
  findByEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.asistenciasService.findByEmpleadoYFechas(
      id,
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  @Get('rango')
  @Roles('administrador', 'supervisor')
  findByRango(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.asistenciasService.findByRango(
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  @Get('fecha/:fecha')
  @Roles('administrador', 'supervisor')
  findByFecha(@Param('fecha') fecha: string) {
    return this.asistenciasService.findByFecha(new Date(fecha));
  }

  @Get('reporte/detallado')
  @Roles('administrador', 'supervisor')
  getReporteDetallado(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.asistenciasService.getReporteDetallado(
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  @Get('export/excel')
  @Roles('administrador', 'supervisor')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="reporte_asistencias.xlsx"')
  async exportExcel(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('empleadoId') empleadoId?: number,
  ) {
    const buffer = await this.asistenciasService.generateExcelReport(
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
      empleadoId,
    );

    return new StreamableFile(buffer as any);
  }

  @Get('export/pdf')
  @Roles('administrador', 'supervisor')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="reporte_asistencias.pdf"')
  async exportPdf(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('empleadoId') empleadoId?: number,
  ) {
    const buffer = await this.asistenciasService.generatePdfReport(
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
      empleadoId,
    );

    return new StreamableFile(buffer as any);
  }

  @Post('generar-faltas')
  @Roles('administrador')
  generarFaltas(@Query('fecha') fecha?: string) {
    const fechaTarget = fecha ? new Date(fecha) : undefined;
    return this.asistenciasService.generarFaltasAutomaticas(fechaTarget);
  }

  @Patch(':id')
  @Roles('administrador')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ) {
    return this.asistenciasService.update(id, updateAsistenciaDto);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciasService.remove(id);
  }
}
