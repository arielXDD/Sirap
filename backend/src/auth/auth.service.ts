import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Usuario } from '../usuarios/usuario.entity';
import { MailService } from './mail.service';
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
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Buscar usuario con passwordHash y campos de bloqueo
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

    // 1. Verificar si está bloqueado
    if (usuario.bloqueado) {
      if (usuario.rol === 'administrador') {
        throw new ForbiddenException('Cuenta bloqueada por seguridad. Revisa tu correo para el código de desbloqueo.');
      } else {
        throw new ForbiddenException('Cuenta bloqueada. Contacta al administrador para el desbloqueo.');
      }
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);
    
    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      const nuevosIntentos = usuario.intentosFallidos + 1;
      const debeBloquear = nuevosIntentos >= 5;

      const updateData: any = { intentosFallidos: nuevosIntentos };
      
      if (debeBloquear) {
        updateData.bloqueado = true;
        
        // Si es administrador, generar y enviar código
        if (usuario.rol === 'administrador') {
          const codigo = Math.random().toString().slice(2, 8); // Código de 6 dígitos
          const expiracion = new Date();
          expiracion.setMinutes(expiracion.getMinutes() + 30);
          
          updateData.codigoDesbloqueo = codigo;
          updateData.codigoDesbloqueoExpiracion = expiracion;
          
          if (usuario.empleado?.email) {
            await this.mailService.sendUnlockCode(usuario.empleado.email, codigo);
            console.log(`[Seguridad] Código de desbloqueo para admin: ${codigo}`);
          }
        }
      }

      await this.usuarioRepository.update(usuario.id, updateData);

      if (debeBloquear) {
        if (usuario.rol === 'administrador') {
          throw new ForbiddenException('Has excedido los 5 intentos. Se ha enviado un código de desbloqueo a tu correo.');
        } else {
          throw new ForbiddenException('Has excedido los 5 intentos. Tu cuenta ha sido bloqueada. Contacta al administrador.');
        }
      }

      throw new UnauthorizedException(`Credenciales inválidas. Intentos restantes: ${5 - nuevosIntentos}`);
    }

    // 3. Login exitoso -> resetear intentos
    if (usuario.intentosFallidos > 0) {
      await this.usuarioRepository.update(usuario.id, { 
        intentosFallidos: 0,
        bloqueado: false,
        codigoDesbloqueo: null as any,
        codigoDesbloqueoExpiracion: null as any
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

  /**
   * Desbloqueo manual por Admin (para empleados/supervisores)
   */
  async unlockUser(usuarioId: number, adminId: number) {
    const admin = await this.usuarioRepository.findOne({ where: { id: adminId } });
    if (!admin || admin.rol !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede desbloquear cuentas.');
    }

    await this.usuarioRepository.update(usuarioId, {
      bloqueado: false,
      intentosFallidos: 0,
      codigoDesbloqueo: null as any,
      codigoDesbloqueoExpiracion: null as any
    });

    return { message: 'Usuario desbloqueado correctamente.' };
  }

  /**
   * Auto-desbloqueo por Admin mediante código de correo
   */
  async verifyUnlockCode(username: string, code: string) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.codigoDesbloqueo')
      .addSelect('usuario.codigoDesbloqueoExpiracion')
      .where('usuario.username = :username', { username })
      .andWhere('usuario.rol = :rol', { rol: 'administrador' })
      .getOne();

    if (!usuario) throw new NotFoundException('Administrador no encontrado');

    if (usuario.codigoDesbloqueo !== code) {
      throw new BadRequestException('Código de desbloqueo incorrecto');
    }

    if (new Date() > new Date(usuario.codigoDesbloqueoExpiracion)) {
      throw new BadRequestException('El código ha expirado. Intenta iniciar sesión de nuevo para generar uno nuevo.');
    }

    await this.usuarioRepository.update(usuario.id, {
      bloqueado: false,
      intentosFallidos: 0,
      codigoDesbloqueo: null as any,
      codigoDesbloqueoExpiracion: null as any
    });

    return { message: 'Cuenta desbloqueada. Ya puedes iniciar sesión.' };
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

  async requestPasswordReset(username: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { username, activo: true },
      relations: ['empleado'],
    });

    if (!usuario || !usuario.empleado?.email) {
      return { message: 'Si el usuario existe y tiene correo registrado, recibirás un enlace en breve.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);

    await this.usuarioRepository.update(usuario.id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    } as any);

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    let emailSent = false;
    try {
      await this.mailService.sendPasswordResetEmail(usuario.empleado.email, token);
      emailSent = true;
    } catch {
      console.warn('[Auth] Error enviando reset email');
    }

    const response: { message: string, preview?: string } = {
      message: `Correo enviado a ${usuario.empleado.email}.`
    };

    if (!emailSent) {
      response.message = `[MODO DEMO] Correo simulado a: ${usuario.empleado.email}`;
      response.preview = resetLink;
    }

    return response;
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
      bloqueado: false
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }
}
