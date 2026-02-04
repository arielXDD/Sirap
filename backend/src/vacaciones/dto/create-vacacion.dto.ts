import { IsInt, IsDateString, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateVacacionDto {
  @IsNotEmpty()
  @IsInt()
  empleadoId: number;

  @IsNotEmpty()
  @IsDateString()
  fechaInicio: string;

  @IsNotEmpty()
  @IsDateString()
  fechaFin: string;

  @IsNotEmpty()
  @IsInt()
  diasSolicitados: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
