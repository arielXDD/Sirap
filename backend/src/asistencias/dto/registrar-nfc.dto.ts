import { IsInt, IsNotEmpty } from 'class-validator';

export class RegistrarNfcDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del empleado es requerido' })
  empleadoId: number;
}
