import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Asistencia } from './asistencia.entity';
import { Empleado } from '../empleados/empleado.entity';
import { Horario } from '../horarios/horario.entity';
import { Vacacion } from '../vacaciones/vacacion.entity';
import { Permiso } from '../permisos/permiso.entity';
import { DiaFestivo } from '../dias-festivos/dia-festivo.entity';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Horario)
    private readonly horarioRepository: Repository<Horario>,
    @InjectRepository(Vacacion)
    private readonly vacacionRepository: Repository<Vacacion>,
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
    @InjectRepository(DiaFestivo)
    private readonly diaFestivoRepository: Repository<DiaFestivo>,
  ) {}

  /**
   * Registra entrada o salida de un empleado
   */
  async registrarAsistencia(
    empleadoId: number,
    tipoRegistro: 'normal' | 'manual' = 'normal',
  ): Promise<Asistencia> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id: empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${empleadoId} no encontrado`);
    }

    const fechaActual = new Date();
    const fechaStr = fechaActual.toISOString().split('T')[0];
    const horaActual = fechaActual.toTimeString().split(' ')[0];

    // Buscar asistencia del día
    let asistencia = await this.asistenciaRepository.findOne({
      where: {
        empleadoId,
        fecha: new Date(fechaStr) as any,
      },
    });

    if (!asistencia) {
      // Registrar entrada
      asistencia = this.asistenciaRepository.create({
        empleadoId,
        fecha: new Date(fechaStr) as any,
        horaEntrada: horaActual,
        tipoRegistro,
      });

      // Calcular si es retardo
      await this.calcularEstadoAsistencia(asistencia, empleado);

      return await this.asistenciaRepository.save(asistencia);
    } else {
      // Registrar salida
      if (asistencia.horaSalida) {
        throw new BadRequestException(
          'Ya se registró la salida para el día de hoy',
        );
      }

      asistencia.horaSalida = horaActual;
      return await this.asistenciaRepository.save(asistencia);
    }
  }

  /**
   * Calcula automáticamente si la asistencia es puntual o retardo
   */
  private async calcularEstadoAsistencia(
    asistencia: Asistencia,
    empleado: Empleado,
  ): Promise<void> {
    const fechaAsistencia = new Date(asistencia.fecha);
    const diaSemana = this.obtenerDiaSemana(fechaAsistencia);

    // Buscar horario del empleado para ese día
    const horario = await this.horarioRepository.findOne({
      where: {
        empleadoId: empleado.id,
        diaSemana,
        activo: true,
      },
    });

    if (!horario) {
      asistencia.estado = 'puntual';
      return;
    }

    // Comparar hora de entrada
    const horaEntrada = asistencia.horaEntrada;
    const horaEsperada = horario.horaEntrada;
    const tolerancia = horario.toleranciaMinutos;

    const minutosRetardo = this.calcularMinutosRetardo(
      horaEntrada,
      horaEsperada,
    );

    if (minutosRetardo <= 0) {
      asistencia.estado = 'puntual';
      asistencia.minutosRetardo = 0;
    } else if (minutosRetardo <= tolerancia) {
      asistencia.estado = 'puntual';
      asistencia.minutosRetardo = minutosRetardo;
    } else {
      asistencia.estado = 'retardo';
      asistencia.minutosRetardo = minutosRetardo;
    }
  }

  /**
   * Calcula los minutos de retardo entre dos horas
   */
  private calcularMinutosRetardo(
    horaEntrada: string,
    horaEsperada: string,
  ): number {
    const [hEntrada, mEntrada] = horaEntrada.split(':').map(Number);
    const [hEsperada, mEsperada] = horaEsperada.split(':').map(Number);

    const minutosEntrada = hEntrada * 60 + mEntrada;
    const minutosEsperados = hEsperada * 60 + mEsperada;

    return minutosEntrada - minutosEsperados;
  }

  /**
   * Obtiene el día de la semana en español
   */
  private obtenerDiaSemana(fecha: Date): string {
    const dias = [
      'domingo',
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
    ];
    return dias[fecha.getDay()];
  }

  /**
   * Genera faltas automáticas para empleados que no registraron asistencia
   * Este método debe ejecutarse diariamente (puede ser mediante un cron job)
   */
  async generarFaltasAutomaticas(fecha?: Date): Promise<void> {
    const fechaTarget = fecha || new Date();
    const fechaStr = fechaTarget.toISOString().split('T')[0];
    const diaSemana = this.obtenerDiaSemana(fechaTarget);

    // Verificar si es día festivo
    const esFestivo = await this.diaFestivoRepository.findOne({
      where: { fecha: new Date(fechaStr) as any },
    });

    if (esFestivo) {
      return; // No generar faltas en días festivos
    }

    // Obtener todos los empleados activos
    const empleados = await this.empleadoRepository.find({
      where: { estatus: 'activo' },
    });

    for (const empleado of empleados) {
      // Verificar si ya tiene asistencia registrada
      const asistenciaExistente = await this.asistenciaRepository.findOne({
        where: {
          empleadoId: empleado.id,
          fecha: new Date(fechaStr) as any,
        },
      });

      if (asistenciaExistente) {
        continue; // Ya tiene registro
      }

      // Verificar si tiene vacaciones
      const tieneVacaciones = await this.vacacionRepository.findOne({
        where: {
          empleadoId: empleado.id,
          estado: 'aprobada',
        },
      });

      if (tieneVacaciones) {
        const fechaInicio = new Date(tieneVacaciones.fechaInicio);
        const fechaFin = new Date(tieneVacaciones.fechaFin);
        if (fechaTarget >= fechaInicio && fechaTarget <= fechaFin) {
          continue; // Está de vacaciones
        }
      }

      // Verificar si tiene permiso
      const tienePermiso = await this.permisoRepository.findOne({
        where: {
          empleadoId: empleado.id,
          autorizado: true,
        },
      });

      if (tienePermiso) {
        const fechaInicio = new Date(tienePermiso.fechaInicio);
        const fechaFin = new Date(tienePermiso.fechaFin);
        if (fechaTarget >= fechaInicio && fechaTarget <= fechaFin) {
          // Crear asistencia justificada
          const asistencia = this.asistenciaRepository.create({
            empleadoId: empleado.id,
            fecha: new Date(fechaStr) as any,
            estado: 'justificada',
            tipoRegistro: 'manual',
            observaciones: `Permiso autorizado: ${tienePermiso.tipo}`,
          });
          await this.asistenciaRepository.save(asistencia);
          continue;
        }
      }

      // Verificar si tiene horario ese día
      const tieneHorario = await this.horarioRepository.findOne({
        where: {
          empleadoId: empleado.id,
          diaSemana,
          activo: true,
        },
      });

      if (!tieneHorario) {
        continue; // No labora ese día
      }

      // Generar falta
      const falta = this.asistenciaRepository.create({
        empleadoId: empleado.id,
        fecha: new Date(fechaStr) as any,
        estado: 'falta',
        tipoRegistro: 'manual',
        observaciones: 'Falta generada automáticamente',
      });

      await this.asistenciaRepository.save(falta);
    }
  }

  /**
   * Obtiene las asistencias de un empleado en un rango de fechas
   */
  async findByEmpleadoYFechas(
    empleadoId: number,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Asistencia[]> {
    return await this.asistenciaRepository.find({
      where: {
        empleadoId,
        fecha: Between(fechaInicio, fechaFin) as any,
      },
      order: { fecha: 'DESC' },
    });
  }

  /**
   * Obtiene todas las asistencias de un día específico
   */
  async findByFecha(fecha: Date): Promise<Asistencia[]> {
    return await this.asistenciaRepository.find({
      where: { fecha: fecha as any },
      relations: ['empleado'],
      order: { horaEntrada: 'ASC' },
    });
  }

  /**
   * Registro manual de asistencia por un administrador
   */
  async createManual(createAsistenciaDto: CreateAsistenciaDto): Promise<Asistencia> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id: createAsistenciaDto.empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(
        `Empleado con ID ${createAsistenciaDto.empleadoId} no encontrado`,
      );
    }

    const asistencia = this.asistenciaRepository.create({
      ...createAsistenciaDto,
      fecha: new Date(createAsistenciaDto.fecha) as any,
      tipoRegistro: 'manual',
    });

    // Si tiene hora de entrada, calcular estado
    if (asistencia.horaEntrada) {
      await this.calcularEstadoAsistencia(asistencia, empleado);
    }

    return await this.asistenciaRepository.save(asistencia);
  }
  async generateExcelReport(fechaInicio?: Date, fechaFin?: Date, empleadoId?: number) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asistencias');

    // Estilos
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Empleado', key: 'empleado', width: 30 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Entrada', key: 'entrada', width: 15 },
      { header: 'Salida', key: 'salida', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Retardo (min)', key: 'retardo', width: 15 },
    ];

    // Obtener datos
    const asistencias = await this.findAll(fechaInicio, fechaFin, empleadoId);

    // Agregar filas
    asistencias.forEach((asistencia) => {
      worksheet.addRow({
        id: asistencia.id,
        empleado: `${asistencia.empleado.nombre} ${asistencia.empleado.apellidos}`,
        fecha: asistencia.fecha.toISOString().split('T')[0],
        entrada: asistencia.horaEntrada || '-',
        salida: asistencia.horaSalida || '-',
        estado: asistencia.estado,
        retardo: asistencia.minutosRetardo || 0,
      });
    });

    // Dar formato al encabezado
    worksheet.getRow(1).font = { bold: true };
    
    return await workbook.xlsx.writeBuffer();
  }

  async generatePdfReport(fechaInicio?: Date, fechaFin?: Date, empleadoId?: number): Promise<Buffer> {
    // Obtener datos primero
    const asistencias = await this.findAll(fechaInicio, fechaFin, empleadoId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.on('error', (err) => {
        reject(err);
      });

      // Encabezado del PDF
      doc.fontSize(20).text('Reporte de Asistencias', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generado el: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Tabla simple (simulada con texto por ahora)
      const tableTop = 150;
      let y = tableTop;

      // Encabezados de tabla
      doc.font('Helvetica-Bold');
      doc.text('Fecha', 50, y);
      doc.text('Empleado', 150, y);
      doc.text('Entrada', 350, y);
      doc.text('Salida', 420, y);
      doc.text('Estado', 490, y);
      
      y += 20;
      doc.font('Helvetica');

      // Filas
      asistencias.forEach((asistencia) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(asistencia.fecha.toISOString().split('T')[0], 50, y);
        doc.text(`${asistencia.empleado.nombre} ${asistencia.empleado.apellidos}`.substring(0, 25), 150, y);
        doc.text(asistencia.horaEntrada || '-', 350, y);
        doc.text(asistencia.horaSalida || '-', 420, y);
        doc.text(asistencia.estado, 490, y);
        
        y += 20;
      });

      doc.end();
    });
  }

  // Método auxiliar para obtener datos con filtros (reutilizable)
  async findAll(fechaInicio?: Date, fechaFin?: Date, empleadoId?: number): Promise<Asistencia[]> {
    const query = this.asistenciaRepository.createQueryBuilder('asistencia')
      .leftJoinAndSelect('asistencia.empleado', 'empleado')
      .orderBy('asistencia.fecha', 'DESC');

    if (fechaInicio) {
      query.andWhere('asistencia.fecha >= :fechaInicio', { fechaInicio });
    }
    
    if (fechaFin) {
      query.andWhere('asistencia.fecha <= :fechaFin', { fechaFin });
    }

    if (empleadoId) {
      query.andWhere('empleado.id = :empleadoId', { empleadoId });
    }

    return await query.getMany();
  }
}
