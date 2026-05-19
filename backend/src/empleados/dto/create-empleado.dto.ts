import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  @IsNotEmpty({ message: 'El número de empleado es requerido' })
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9\-_]+$/, {
    message: 'El número de empleado solo puede contener letras, números, guiones y guiones bajos',
  })
  numeroEmpleado: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MaxLength(100)
  apellidos: string;

  @IsString()
  @IsNotEmpty({ message: 'El puesto es requerido' })
  @MaxLength(100)
  puesto: string;

  @IsString()
  @IsNotEmpty({ message: 'El área es requerida' })
  @MaxLength(100)
  area: string;

  @IsEmail({}, { message: 'El formato del correo es inválido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de ingreso es requerida' })
  fechaIngreso: string;

  @IsEnum(['activo', 'inactivo', 'suspendido'], {
    message: 'El estatus debe ser: activo, inactivo o suspendido',
  })
  estatus: string;

  @IsString()
  @IsOptional()
  fotoUrl?: string;
}
