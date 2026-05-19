import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número',
  })
  password: string;

  @IsEnum(['administrador', 'supervisor', 'empleado'], {
    message: 'El rol debe ser: administrador, supervisor o empleado',
  })
  rol: string;

  @IsInt()
  @IsNotEmpty()
  empleadoId: number;
}
