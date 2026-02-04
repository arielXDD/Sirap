import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
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

  async findAll(): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      order: { numeroEmpleado: 'ASC' },
    });
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
    return await this.empleadoRepository.save(empleado);
  }

  async remove(id: number): Promise<void> {
    const empleado = await this.findOne(id);
    await this.empleadoRepository.remove(empleado);
  }

  async deactivate(id: number): Promise<Empleado> {
    const empleado = await this.findOne(id);
    empleado.estatus = 'inactivo';
    return await this.empleadoRepository.save(empleado);
  }

  async findActivos(): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      where: { estatus: 'activo' },
      order: { numeroEmpleado: 'ASC' },
    });
  }
}
