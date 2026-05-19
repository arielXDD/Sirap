import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateVacacionDto } from './create-vacacion.dto';

export class UpdateVacacionDto extends PartialType(CreateVacacionDto) {
  @IsOptional()
  @IsEnum(['pendiente', 'aprobada', 'rechazada'])
  estado?: string;
}
