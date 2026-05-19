import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';

export class UpdateAsistenciaDto {
  @IsOptional()
  @IsString()
  horaEntrada?: string;

  @IsOptional()
  @IsString()
  horaSalida?: string;

  @IsOptional()
  @IsEnum(['puntual', 'retardo', 'falta', 'justificada'])
  estado?: string;

  @IsOptional()
  @IsInt()
  minutosRetardo?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
