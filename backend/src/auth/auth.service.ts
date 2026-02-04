import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Buscar usuario con la contraseña (select: false en entity)
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .leftJoinAndSelect('usuario.empleado', 'empleado')
      .where('usuario.username = :username', { username })
      .andWhere('usuario.activo = :activo', { activo: true })
      .getOne();

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload: JwtPayload = {
      sub: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      empleadoId: usuario.empleadoId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        empleado: {
          id: usuario.empleado.id,
          numeroEmpleado: usuario.empleado.numeroEmpleado,
          nombre: usuario.empleado.nombre,
          apellidos: usuario.empleado.apellidos,
          puesto: usuario.empleado.puesto,
          area: usuario.empleado.area,
        },
      },
    };
  }

  async validateUser(payload: JwtPayload) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub, activo: true },
      relations: ['empleado'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return usuario;
  }
}
