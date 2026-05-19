import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { TarjetaNfc } from '../tarjetas-nfc/tarjeta-nfc.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(TarjetaNfc)
    private readonly tarjetaNfcRepository: Repository<TarjetaNfc>,
  ) {}

  async restartServer(userId: number, password: string, nfcUID: string) {
    if (!password || !nfcUID) {
      throw new UnauthorizedException('Contraseña y código NFC son requeridos');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'passwordHash', 'rol', 'empleadoId'],
      relations: ['empleado'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (usuario.rol !== 'administrador') {
      throw new ForbiddenException('Solo los administradores pueden reiniciar el servidor');
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Verify NFC UID of the admin
    const tarjeta = await this.tarjetaNfcRepository.findOne({
      where: { empleadoId: usuario.empleadoId },
    });

    if (!tarjeta) {
      throw new ForbiddenException('El administrador no tiene una tarjeta NFC asignada');
    }

    // Comparing NFC UID (case insensitive or exact depends on how it's stored)
    if (tarjeta.codigoNfc.toLowerCase() !== nfcUID.toLowerCase()) {
      throw new ForbiddenException('El código NFC no coincide con el del administrador');
    }

    // Log the event
    console.log(`[SYSTEM] Reinicio del servidor solicitado por el administrador ${usuario.username}`);
    
    // Schedule restart
    setTimeout(() => {
      console.log('[SYSTEM] Reiniciando proceso...');
      process.exit(0);
    }, 1500);

    return { message: 'El servidor se reiniciará en unos segundos...' };
  }
}
