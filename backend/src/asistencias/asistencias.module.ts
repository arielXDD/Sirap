import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { Asistencia } from './asistencia.entity';
import { Empleado } from '../empleados/empleado.entity';
import { Horario } from '../horarios/horario.entity';
import { Vacacion } from '../vacaciones/vacacion.entity';
import { Permiso } from '../permisos/permiso.entity';
import { DiaFestivo } from '../dias-festivos/dia-festivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asistencia,
      Empleado,
      Horario,
      Vacacion,
      Permiso,
      DiaFestivo,
    ]),
  ],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService],
})
export class AsistenciasModule {}
