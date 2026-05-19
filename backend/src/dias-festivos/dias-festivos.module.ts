import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiasFestivosService } from './dias-festivos.service';
import { DiasFestivosController } from './dias-festivos.controller';
import { DiaFestivo } from './dia-festivo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiaFestivo])],
  controllers: [DiasFestivosController],
  providers: [DiasFestivosService],
  exports: [DiasFestivosService],
})
export class DiasFestivosModule {}
