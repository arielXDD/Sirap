import { IsNotEmpty, IsEnum, IsString, IsDateString } from 'class-validator';

export class CreateDiaFestivoDto {
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsEnum(['no_laborable', 'laborable_especial'])
  @IsNotEmpty()
  tipo: string;
}
