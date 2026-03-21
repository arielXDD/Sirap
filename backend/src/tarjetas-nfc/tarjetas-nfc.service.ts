import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarjetaNfc } from './tarjeta-nfc.entity';

@Injectable()
export class TarjetasNfcService {
  constructor(
    @InjectRepository(TarjetaNfc)
    private readonly tarjetaRepository: Repository<TarjetaNfc>,
  ) {}

  async findAll(): Promise<TarjetaNfc[]> {
    return this.tarjetaRepository.find({ relations: ['empleado'] });
  }

  async findOne(id: number): Promise<TarjetaNfc> {
    const tarjeta = await this.tarjetaRepository.findOne({
      where: { id },
      relations: ['empleado'],
    });
    if (!tarjeta) {
      throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
    }
    return tarjeta;
  }

  async create(codigoNfc: string, empleadoId: number): Promise<TarjetaNfc> {
    // Verificar que no exista una tarjeta con el mismo código
    const existente = await this.tarjetaRepository.findOne({ where: { codigoNfc } });
    if (existente) {
      throw new ConflictException(`Ya existe una tarjeta con el código ${codigoNfc}`);
    }

    // Verificar que el empleado no tenga ya una tarjeta
    const tarjetaEmpleado = await this.tarjetaRepository.findOne({ where: { empleadoId } });
    if (tarjetaEmpleado) {
      throw new ConflictException(`El empleado ya tiene una tarjeta asignada (${tarjetaEmpleado.codigoNfc})`);
    }

    const tarjeta = this.tarjetaRepository.create({
      codigoNfc,
      empleadoId,
      fechaAsignacion: new Date(),
      activa: true,
    });

    return this.tarjetaRepository.save(tarjeta);
  }

  async toggleActiva(id: number): Promise<TarjetaNfc> {
    const tarjeta = await this.findOne(id);
    tarjeta.activa = !tarjeta.activa;
    return this.tarjetaRepository.save(tarjeta);
  }

  async reasignar(id: number, nuevoCodigoNfc: string): Promise<TarjetaNfc> {
    const tarjeta = await this.findOne(id);

    // Verificar que el nuevo código no esté ya en uso por otra tarjeta
    const existente = await this.tarjetaRepository.findOne({ where: { codigoNfc: nuevoCodigoNfc } });
    if (existente && existente.id !== id) {
      throw new ConflictException(`El código ${nuevoCodigoNfc} ya está asignado a otro empleado`);
    }

    tarjeta.codigoNfc = nuevoCodigoNfc;
    tarjeta.fechaAsignacion = new Date();
    tarjeta.activa = true;
    return this.tarjetaRepository.save(tarjeta);
  }

  async delete(id: number): Promise<void> {
    const tarjeta = await this.findOne(id);
    await this.tarjetaRepository.remove(tarjeta);
  }
}
