import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { Empleado } from '../empleados/empleado.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  async findAll(pagination?: PaginationDto): Promise<PaginatedResult<Usuario> | Usuario[]> {
    if (!pagination) {
      return this.usuarioRepository.find({ relations: ['empleado'] });
    }
    const { page, limit } = pagination;
    const [data, total] = await this.usuarioRepository.findAndCount({
      relations: ['empleado'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: { username: string; password: string; rol: string; empleadoId: number }): Promise<Usuario> {
    const existente = await this.usuarioRepository.findOne({ where: { username: data.username } });
    if (existente) {
      throw new ConflictException(`El username "${data.username}" ya está en uso`);
    }
    const empleadoConUsuario = await this.usuarioRepository.findOne({ where: { empleadoId: data.empleadoId } });
    if (empleadoConUsuario) {
      throw new ConflictException('Este empleado ya tiene un usuario asignado');
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const usuario = this.usuarioRepository.create({
      username: data.username,
      passwordHash,
      rol: data.rol as any,
      empleadoId: data.empleadoId,
      activo: true,
    });
    return this.usuarioRepository.save(usuario);
  }

  async update(id: number, data: { username?: string; rol?: string; activo?: boolean }): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    if (data.username) {
      const existente = await this.usuarioRepository.findOne({ where: { username: data.username } });
      if (existente && existente.id !== id) throw new ConflictException(`El username "${data.username}" ya está en uso`);
      usuario.username = data.username;
    }
    if (data.rol) usuario.rol = data.rol as any;
    if (data.activo !== undefined) {
      usuario.activo = data.activo;
      // Sincronizar con el empleado
      const empleado = await this.empleadoRepository.findOne({ where: { id: usuario.empleadoId } });
      if (empleado) {
        empleado.estatus = data.activo ? 'activo' : 'inactivo';
        await this.empleadoRepository.save(empleado);
      }
    }
    return this.usuarioRepository.save(usuario);
  }

  async resetPassword(id: number, newPassword: string): Promise<{ message: string }> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    usuario.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usuarioRepository.save(usuario);
    return { message: 'Contraseña actualizada exitosamente' };
  }
}
