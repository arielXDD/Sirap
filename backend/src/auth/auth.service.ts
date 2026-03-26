import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Usuario } from '../usuarios/usuario.entity';
import { MailService } from './mail.service';
import { SmsService } from './sms.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .addSelect('usuario.intentosFallidos')
      .addSelect('usuario.bloqueado')
      .leftJoinAndSelect('usuario.empleado', 'empleado')
      .where('usuario.username = :username', { username })
      .andWhere('usuario.activo = :activo', { activo: true })
      .getOne();

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.bloqueado) {
      if (usuario.rol === 'administrador') {
        throw new ForbiddenException('Cuenta bloqueada. Revisa tu correo o SMS para el código de desbloqueo.');
      } else {
        throw new ForbiddenException('Cuenta bloqueada. Contacta al administrador para el desbloqueo.');
      }
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);

    if (!isPasswordValid) {
      const nuevosIntentos = usuario.intentosFallidos + 1;
      const debeBloquear = nuevosIntentos >= 5;
      const updateData: any = { intentosFallidos: nuevosIntentos };

      if (debeBloquear) {
        updateData.bloqueado = true;

        if (usuario.rol === 'administrador') {
          const codigo = Math.floor(100000 + Math.random() * 900000).toString();
          const expiracion = new Date();
          expiracion.setMinutes(expiracion.getMinutes() + 30);

          updateData.codigoDesbloqueo = codigo;
          updateData.codigoDesbloqueoExpiracion = expiracion;

          if (usuario.empleado?.email) {
            try {
              const result = await this.mailService.sendUnlockCode(usuario.empleado.email, codigo);
              if (result.sent) {
                console.log(`[Auth] Código de desbloqueo enviado por correo a ${usuario.empleado.email}`);
              } else {
                console.log(`[Auth DEMO] *** CÓDIGO DE DESBLOQUEO ADMIN: ${codigo} ***`);
              }
            } catch (e) {
              console.log(`[Auth DEMO] *** CÓDIGO DE DESBLOQUEO ADMIN: ${codigo} ***`);
            }
          } else {
            console.log(`[Auth DEMO] *** CÓDIGO DE DESBLOQUEO ADMIN: ${codigo} ***`);
          }

          if (usuario.empleado?.telefono) {
            const smsResult = await this.smsService.sendUnlockCode(
              usuario.empleado.telefono,
              codigo,
            );
            if (!smsResult.sent && smsResult.preview) {
              console.log(`[Auth SMS DEMO] ${smsResult.preview}`);
            }
          }
        }
      }

      await this.usuarioRepository.update(usuario.id, updateData);

      if (debeBloquear) {
        if (usuario.rol === 'administrador') {
          const canales: string[] = [];
          if (usuario.empleado?.email) canales.push('correo');
          if (usuario.empleado?.telefono) canales.push('SMS');
          const canalMsg = canales.length > 0 ? `a tu ${canales.join(' y ')}` : '';
          throw new ForbiddenException(
            `Has excedido los 5 intentos. Se ha enviado un código de desbloqueo ${canalMsg}.`,
          );
        } else {
          throw new ForbiddenException('Has excedido los 5 intentos. Tu cuenta ha sido bloqueada. Contacta al administrador.');
        }
      }

      throw new UnauthorizedException(`Credenciales inválidas. Intentos restantes: ${5 - nuevosIntentos}`);
    }

    if (usuario.intentosFallidos > 0) {
      await this.usuarioRepository.update(usuario.id, {
        intentosFallidos: 0,
        bloqueado: false,
        codigoDesbloqueo: null as any,
        codigoDesbloqueoExpiracion: null as any,
      });
    }

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

  async unlockUser(usuarioId: number, adminId: number) {
    const admin = await this.usuarioRepository.findOne({ where: { id: adminId } });
    if (!admin || admin.rol !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede desbloquear cuentas.');
    }

    await this.usuarioRepository.update(usuarioId, {
      bloqueado: false,
      intentosFallidos: 0,
      codigoDesbloqueo: null as any,
      codigoDesbloqueoExpiracion: null as any,
    });

    return { message: 'Usuario desbloqueado correctamente.' };
  }

  async verifyUnlockCode(username: string, code: string) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.codigoDesbloqueo')
      .addSelect('usuario.codigoDesbloqueoExpiracion')
      .where('usuario.username = :username', { username })
      .andWhere('usuario.rol = :rol', { rol: 'administrador' })
      .getOne();

    if (!usuario) throw new NotFoundException('Administrador no encontrado');
    if (usuario.codigoDesbloqueo !== code) throw new BadRequestException('Código de desbloqueo incorrecto');
    if (new Date() > new Date(usuario.codigoDesbloqueoExpiracion)) {
      throw new BadRequestException('El código ha expirado. Intenta iniciar sesión de nuevo para generar uno nuevo.');
    }

    await this.usuarioRepository.update(usuario.id, {
      bloqueado: false,
      intentosFallidos: 0,
      codigoDesbloqueo: null as any,
      codigoDesbloqueoExpiracion: null as any,
    });

    return { message: 'Cuenta desbloqueada. Ya puedes iniciar sesión.' };
  }

  async validateUser(payload: JwtPayload) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub, activo: true },
      relations: ['empleado'],
    });

    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');
    return usuario;
  }

  // ── Recuperación por Email: el usuario escribe su correo ──────────────────
  async requestPasswordReset(email: string) {
    // Buscar usuario por el correo del empleado registrado
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.empleado', 'empleado')
      .where('LOWER(empleado.email) = LOWER(:email)', { email })
      .andWhere('usuario.activo = :activo', { activo: true })
      .getOne();

    if (!usuario) {
      throw new BadRequestException('No existe ninguna cuenta asociada a ese correo electrónico.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);

    await this.usuarioRepository.update(usuario.id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    } as any);

    const result = await this.mailService.sendPasswordResetEmail(email, token);

    if (!result.sent) {
      return {
        message: `[MODO DEMO] Correo simulado a: ${email}`,
        preview: result.preview,
      };
    }

    return { message: `Enlace de recuperación enviado a ${email}.` };
  }

  // ── Recuperación por SMS: el usuario escribe su correo, se manda SMS ──────
  async requestPasswordResetSms(email: string) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.empleado', 'empleado')
      .where('LOWER(empleado.email) = LOWER(:email)', { email })
      .andWhere('usuario.activo = :activo', { activo: true })
      .andWhere('usuario.rol = :rol', { rol: 'administrador' })
      .getOne();

    if (!usuario) {
      throw new BadRequestException('No existe un administrador asociado a ese correo.');
    }

    if (!usuario.empleado?.telefono) {
      throw new BadRequestException('Este administrador no tiene número de teléfono registrado.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);

    await this.usuarioRepository.update(usuario.id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    } as any);

    const result = await this.smsService.sendPasswordResetSms(usuario.empleado.telefono, token);

    if (!result.sent) {
      return {
        message: `[MODO DEMO] SMS simulado al teléfono registrado.`,
        preview: result.preview,
      };
    }

    return { message: `SMS enviado al número registrado.` };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) throw new BadRequestException('Datos incompletos');
    if (newPassword.length < 6) throw new BadRequestException('Contraseña muy corta');

    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.resetToken')
      .addSelect('usuario.resetTokenExpiry')
      .where('usuario.resetToken = :token', { token })
      .getOne();

    if (!usuario || !usuario.resetTokenExpiry || new Date() > new Date(usuario.resetTokenExpiry)) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usuarioRepository.update(usuario.id, {
      passwordHash,
      resetToken: null as any,
      resetTokenExpiry: null as any,
      intentosFallidos: 0,
      bloqueado: false,
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }
}
