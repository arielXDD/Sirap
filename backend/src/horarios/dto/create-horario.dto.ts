import { IsNotEmpty, IsEnum, IsString, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateHorarioDto {
  @IsNumber()
  @IsNotEmpty()
  empleadoId: number;

  @IsEnum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'])
  @IsNotEmpty()
  diaSemana: string;

  @IsString()
  @IsNotEmpty()
  horaEntrada: string;

  @IsString()
  @IsNotEmpty()
  horaSalida: string;

  @IsNumber()
  @IsOptional()
  toleranciaMinutos?: number;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
