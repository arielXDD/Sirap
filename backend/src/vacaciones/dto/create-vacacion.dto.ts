import { IsInt, IsDateString, IsOptional, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { IsAfterOrEqual } from '../../common/validators/date-range.validator';

export class CreateVacacionDto {
  @IsNotEmpty()
  @IsEnum(['vacaciones', 'quinquenio', 'personal', 'permiso_especial', 'salud', 'otro'])
  tipo: string;
  @IsNotEmpty()
  @IsInt()
  empleadoId: number;

  @IsNotEmpty()
  @IsDateString()
  fechaInicio: string;

  @IsNotEmpty()
  @IsDateString()
  @IsAfterOrEqual('fechaInicio', { message: 'fechaFin debe ser mayor o igual a fechaInicio' })
  fechaFin: string;

  @IsNotEmpty()
  @IsInt()
  diasSolicitados: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
