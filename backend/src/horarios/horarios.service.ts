import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from './horario.entity';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario)
    private readonly horarioRepository: Repository<Horario>,
  ) {}

  async create(createHorarioDto: CreateHorarioDto): Promise<Horario> {
    const horario = this.horarioRepository.create(createHorarioDto);
    return await this.horarioRepository.save(horario);
  }

  async findAll(): Promise<Horario[]> {
    return await this.horarioRepository.find({ relations: ['empleado'] });
  }

  async findByEmpleado(empleadoId: number): Promise<Horario[]> {
    return await this.horarioRepository.find({
      where: { empleadoId },
      order: { diaSemana: 'ASC', horaEntrada: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Horario> {
    const horario = await this.horarioRepository.findOne({
      where: { id },
      relations: ['empleado'],
    });
    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }
    return horario;
  }

  async update(id: number, updateHorarioDto: UpdateHorarioDto): Promise<Horario> {
    const horario = await this.findOne(id);
    Object.assign(horario, updateHorarioDto);
    return await this.horarioRepository.save(horario);
  }

  async remove(id: number): Promise<void> {
    const horario = await this.findOne(id);
    await this.horarioRepository.remove(horario);
  }
}
