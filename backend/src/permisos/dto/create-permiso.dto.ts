import { IsNotEmpty, IsEnum, IsString, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { IsAfterOrEqual } from '../../common/validators/date-range.validator';

export class CreatePermisoDto {
  @IsNumber()
  @IsNotEmpty()
  empleadoId: number;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsDateString()
  @IsNotEmpty()
  @IsAfterOrEqual('fechaInicio', { message: 'fechaFin debe ser mayor o igual a fechaInicio' })
  fechaFin: string;

  @IsEnum(['medico', 'personal', 'familiar', 'otro'])
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsBoolean()
  @IsOptional()
  autorizado?: boolean;

  @IsNumber()
  @IsOptional()
  autorizadoPor?: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
