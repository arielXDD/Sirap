import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiaFestivo } from './dia-festivo.entity';
import { CreateDiaFestivoDto } from './dto/create-dia-festivo.dto';
import { UpdateDiaFestivoDto } from './dto/update-dia-festivo.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class DiasFestivosService {
  private readonly logger = new Logger(DiasFestivosService.name);

  constructor(
    @InjectRepository(DiaFestivo)
    private readonly diaFestivoRepository: Repository<DiaFestivo>,
  ) {}

  async create(createDiaFestivoDto: CreateDiaFestivoDto): Promise<DiaFestivo & { asistenciasCorregidas: number }> {
    try {
      const diaFestivo = this.diaFestivoRepository.create(createDiaFestivoDto);
      const saved = await this.diaFestivoRepository.save(diaFestivo);

      // ── Lógica retroactiva ──────────────────────────────────────────────────
      // Si el día festivo ya pasó o es hoy, corregir asistencias con estado 'falta'
      const fechaFestivo = new Date(createDiaFestivoDto.fecha);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);

      let asistenciasCorregidas = 0;

      if (fechaFestivo <= hoy) {
        const fechaStr = createDiaFestivoDto.fecha; // 'YYYY-MM-DD'

        const result = await this.diaFestivoRepository.manager.query(
          `UPDATE asistencias
           SET estado = 'justificada',
               observaciones = CASE
                 WHEN observaciones IS NULL OR observaciones = ''
                   THEN 'Día festivo registrado retroactivamente'
                 ELSE observaciones || ' | Día festivo registrado retroactivamente'
               END,
               "actualizadoEn" = NOW()
           WHERE fecha::date = $1::date
             AND estado = 'falta'`,
          [fechaStr],
        );

        asistenciasCorregidas = result[1] ?? 0;

        if (asistenciasCorregidas > 0) {
          this.logger.log(
            `[DíasFestivos] Retroactivo: ${asistenciasCorregidas} faltas convertidas a "justificada" para el día ${fechaStr}`,
          );
        }
      }

      return { ...saved, asistenciasCorregidas };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un día festivo registrado con esta fecha');
      }
      throw error;
    }
  }

  async findAll(pagination?: PaginationDto): Promise<PaginatedResult<DiaFestivo> | DiaFestivo[]> {
    if (!pagination) {
      return await this.diaFestivoRepository.find({ order: { fecha: 'ASC' } });
    }
    const { page, limit } = pagination;
    const [data, total] = await this.diaFestivoRepository.findAndCount({
      order: { fecha: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<DiaFestivo> {
    const diaFestivo = await this.diaFestivoRepository.findOne({ where: { id } });
    if (!diaFestivo) throw new NotFoundException(`Día festivo con ID ${id} no encontrado`);
    return diaFestivo;
  }

  async update(id: number, updateDiaFestivoDto: UpdateDiaFestivoDto): Promise<DiaFestivo> {
    const diaFestivo = await this.findOne(id);
    Object.assign(diaFestivo, updateDiaFestivoDto);
    return await this.diaFestivoRepository.save(diaFestivo);
  }

  async remove(id: number): Promise<void> {
    const diaFestivo = await this.findOne(id);
    await this.diaFestivoRepository.remove(diaFestivo);
  }

  async findByDates(fechaInicio: Date, fechaFin: Date): Promise<DiaFestivo[]> {
    return await this.diaFestivoRepository.createQueryBuilder('dia')
      .where('dia.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
      .getMany();
  }
}
