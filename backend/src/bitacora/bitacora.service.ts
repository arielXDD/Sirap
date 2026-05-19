import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bitacora } from './bitacora.entity';

@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(Bitacora)
    private readonly bitacoraRepository: Repository<Bitacora>,
  ) {}

  async create(data: Partial<Bitacora>): Promise<Bitacora> {
    const registro = this.bitacoraRepository.create(data);
    return await this.bitacoraRepository.save(registro);
  }

  async findAll(limit = 100) {
    return await this.bitacoraRepository.find({
      relations: ['usuario'],
      order: { fechaHora: 'DESC' },
      take: limit,
    });
  }
}
