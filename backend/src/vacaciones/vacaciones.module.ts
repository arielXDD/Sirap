import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacacionesService } from './vacaciones.service';
import { VacacionesController } from './vacaciones.controller';
import { Vacacion } from './vacacion.entity';
import { EmpleadosModule } from '../empleados/empleados.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vacacion]),
    EmpleadosModule,
  ],
  controllers: [VacacionesController],
  providers: [VacacionesService],
  exports: [VacacionesService],
})
export class VacacionesModule {}
