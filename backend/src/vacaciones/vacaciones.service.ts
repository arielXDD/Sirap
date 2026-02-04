import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacacion } from './vacacion.entity';
import { CreateVacacionDto } from './dto/create-vacacion.dto';
import { UpdateVacacionDto } from './dto/update-vacacion.dto';
import { EmpleadosService } from '../empleados/empleados.service';

@Injectable()
export class VacacionesService {
  constructor(
    @InjectRepository(Vacacion)
    private readonly vacacionRepository: Repository<Vacacion>,
    private readonly empleadosService: EmpleadosService,
  ) {}

  async create(createVacacionDto: CreateVacacionDto): Promise<Vacacion> {
    const empleado = await this.empleadosService.findOne(createVacacionDto.empleadoId);
    
    const vacacion = this.vacacionRepository.create({
      ...createVacacionDto,
      empleado,
    });
    
    return await this.vacacionRepository.save(vacacion);
  }

  async findAll(): Promise<Vacacion[]> {
    return await this.vacacionRepository.find({
      relations: ['empleado'],
      order: { creadoEn: 'DESC' },
    });
  }

  async findByEmpleado(empleadoId: number): Promise<Vacacion[]> {
    return await this.vacacionRepository.find({
      where: { empleadoId },
      order: { fechaInicio: 'DESC' },
    });
  }

  async findPendientes(): Promise<Vacacion[]> {
    return await this.vacacionRepository.find({
      where: { estado: 'pendiente' },
      relations: ['empleado'],
      order: { creadoEn: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Vacacion> {
    const vacacion = await this.vacacionRepository.findOne({
      where: { id },
      relations: ['empleado'],
    });

    if (!vacacion) {
      throw new NotFoundException(`Solicitud de vacaciones con ID ${id} no encontrada`);
    }

    return vacacion;
  }

  async update(id: number, updateVacacionDto: UpdateVacacionDto): Promise<Vacacion> {
    const vacacion = await this.findOne(id);
    Object.assign(vacacion, updateVacacionDto);
    return await this.vacacionRepository.save(vacacion);
  }

  async remove(id: number): Promise<void> {
    const vacacion = await this.findOne(id);
    await this.vacacionRepository.remove(vacacion);
  }

  async aprobar(id: number): Promise<Vacacion> {
    const vacacion = await this.findOne(id);
    if (vacacion.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden aprobar solicitudes pendientes');
    }
    vacacion.estado = 'aprobada';
    return await this.vacacionRepository.save(vacacion);
  }

  async rechazar(id: number): Promise<Vacacion> {
    const vacacion = await this.findOne(id);
    if (vacacion.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden rechazar solicitudes pendientes');
    }
    vacacion.estado = 'rechazada';
    return await this.vacacionRepository.save(vacacion);
  }
}
