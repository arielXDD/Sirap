import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from './permiso.entity';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
  ) {}

  async create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    const permiso = this.permisoRepository.create(createPermisoDto);
    return await this.permisoRepository.save(permiso);
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResult<Permiso> | Permiso[]> {
    if (!pagination) {
      return await this.permisoRepository.find({ relations: ['empleado'] });
    }
    const { page, limit } = pagination;
    const [data, total] = await this.permisoRepository.findAndCount({
      relations: ['empleado'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByEmpleado(empleadoId: number): Promise<Permiso[]> {
    return await this.permisoRepository.find({
      where: { empleadoId },
      order: { fechaInicio: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Permiso> {
    const permiso = await this.permisoRepository.findOne({
      where: { id },
      relations: ['empleado'],
    });
    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
    return permiso;
  }

  async update(id: number, updatePermisoDto: UpdatePermisoDto): Promise<Permiso> {
    const permiso = await this.findOne(id);
    Object.assign(permiso, updatePermisoDto);
    return await this.permisoRepository.save(permiso);
  }

  async authorize(id: number, adminId: number): Promise<Permiso> {
    const permiso = await this.findOne(id);
    permiso.autorizado = true;
    permiso.autorizadoPor = adminId;
    return await this.permisoRepository.save(permiso);
  }

  async remove(id: number): Promise<void> {
    const permiso = await this.findOne(id);
    await this.permisoRepository.remove(permiso);
  }
}
