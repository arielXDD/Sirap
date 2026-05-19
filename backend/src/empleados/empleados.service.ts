import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './empleado.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createEmpleadoDto: CreateEmpleadoDto): Promise<Empleado> {
    // Verificar si el número de empleado ya existe
    const exists = await this.empleadoRepository.findOne({
      where: { numeroEmpleado: createEmpleadoDto.numeroEmpleado },
    });

    if (exists) {
      throw new ConflictException(
        `El número de empleado ${createEmpleadoDto.numeroEmpleado} ya está registrado`,
      );
    }

    const empleado = this.empleadoRepository.create(createEmpleadoDto);
    return await this.empleadoRepository.save(empleado);
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResult<Empleado> | Empleado[]> {
    if (!pagination) {
      return await this.empleadoRepository.find({
        relations: ['usuario', 'tarjetaNfc'],
        order: { numeroEmpleado: 'ASC' },
      });
    }
    const { page, limit } = pagination;
    const [data, total] = await this.empleadoRepository.findAndCount({
      relations: ['usuario', 'tarjetaNfc'],
      order: { numeroEmpleado: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id },
      relations: ['horarios', 'tarjetaNfc', 'usuario'],
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return empleado;
  }

  async findByNumeroEmpleado(numeroEmpleado: string): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({
      where: { numeroEmpleado },
    });

    if (!empleado) {
      throw new NotFoundException(
        `Empleado con número ${numeroEmpleado} no encontrado`,
      );
    }

    return empleado;
  }

  async update(
    id: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
  ): Promise<Empleado> {
    const empleado = await this.findOne(id);

    // Si se está actualizando el número de empleado, verificar que no exista
    if (
      updateEmpleadoDto.numeroEmpleado &&
      updateEmpleadoDto.numeroEmpleado !== empleado.numeroEmpleado
    ) {
      const exists = await this.empleadoRepository.findOne({
        where: { numeroEmpleado: updateEmpleadoDto.numeroEmpleado },
      });

      if (exists) {
        throw new ConflictException(
          `El número de empleado ${updateEmpleadoDto.numeroEmpleado} ya está registrado`,
        );
      }
    }

    Object.assign(empleado, updateEmpleadoDto);
    const savedEmpleado = await this.empleadoRepository.save(empleado);

    // Sincronizar con el usuario si el estatus cambió
    if (updateEmpleadoDto.estatus) {
      const usuario = await this.usuarioRepository.findOne({ where: { empleadoId: id } });
      if (usuario) {
        usuario.activo = updateEmpleadoDto.estatus === 'activo';
        await this.usuarioRepository.save(usuario);
      }
    }

    return savedEmpleado;
  }

  async remove(id: number): Promise<void> {
    const empleado = await this.findOne(id);
    await this.empleadoRepository.remove(empleado);
  }

  async deactivate(id: number): Promise<Empleado> {
    const empleado = await this.findOne(id);
    empleado.estatus = 'inactivo';
    const savedEmpleado = await this.empleadoRepository.save(empleado);

    // Sincronizar con el usuario
    const usuario = await this.usuarioRepository.findOne({ where: { empleadoId: id } });
    if (usuario) {
      usuario.activo = false;
      await this.usuarioRepository.save(usuario);
    }

    return savedEmpleado;
  }

  async findActivos(): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      where: { estatus: 'activo' },
      order: { numeroEmpleado: 'ASC' },
    });
  }
}
