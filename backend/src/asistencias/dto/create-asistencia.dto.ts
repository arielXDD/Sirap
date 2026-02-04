import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateAsistenciaDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del empleado es requerido' })
  empleadoId: number;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha es requerida' })
  fecha: string;

  @IsString()
  @IsOptional()
  horaEntrada?: string;

  @IsString()
  @IsOptional()
  horaSalida?: string;

  @IsEnum(['normal', 'manual'])
  @IsOptional()
  tipoRegistro?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
