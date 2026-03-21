import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Asistencia } from './asistencia.entity';
import { Empleado } from '../empleados/empleado.entity';
import { Horario } from '../horarios/horario.entity';
import { Vacacion } from '../vacaciones/vacacion.entity';
import { Permiso } from '../permisos/permiso.entity';
import { DiaFestivo } from '../dias-festivos/dia-festivo.entity';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
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

    // Buscar si hay una asistencia "abierta" (sin hora de salida) para hoy
    let asistencia = await this.asistenciaRepository.findOne({
      where: {
        empleadoId,
        fecha: new Date(fechaStr) as any,
        horaSalida: IsNull()
      },
      order: { id: 'DESC' }
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
      // Registrar salida en la asistencia abierta
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

    // Buscar todos los horarios del empleado para ese día
    const horarios = await this.horarioRepository.find({
      where: {
        empleadoId: empleado.id,
        diaSemana,
        activo: true,
      },
    });

    if (horarios.length === 0) {
      asistencia.estado = 'puntual';
      return;
    }

    // Encontrar el horario más cercano a la hora de entrada actual
    const [hActual, mActual] = asistencia.horaEntrada.split(':').map(Number);
    const minutosActual = hActual * 60 + mActual;

    let horario = horarios[0];
    let diferenciaMinima = Infinity;

    horarios.forEach(h => {
      const [hEsp, mEsp] = h.horaEntrada.split(':').map(Number);
      const minutosEsp = hEsp * 60 + mEsp;
      const diff = Math.abs(minutosActual - minutosEsp);
      
      if (diff < diferenciaMinima) {
        diferenciaMinima = diff;
        horario = h;
      }
    });

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
   * Calcula las horas trabajadas entre entrada y salida
   */
  private calcularHorasTrabajadas(entrada: string, salida: string): number {
    if (!entrada || !salida) return 0;
    const [hEntrada, mEntrada] = entrada.split(':').map(Number);
    const [hSalida, mSalida] = salida.split(':').map(Number);
    const totalEntrada = hEntrada + mEntrada / 60;
    const totalSalida = hSalida + mSalida / 60;
    return Math.max(0, totalSalida - totalEntrada);
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
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
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
   * Obtiene todas las asistencias de un rango de fechas (más eficiente que N llamadas por día)
   */
  async findByRango(fechaInicio: Date, fechaFin: Date): Promise<Asistencia[]> {
    return await this.asistenciaRepository.find({
      where: { fecha: Between(fechaInicio, fechaFin) as any },
      relations: ['empleado'],
      order: { fecha: 'DESC', horaEntrada: 'ASC' },
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

    const asistencia = (this.asistenciaRepository.create({
      ...createAsistenciaDto,
      fecha: new Date(createAsistenciaDto.fecha) as any,
      tipoRegistro: 'manual',
      horaEntrada: createAsistenciaDto.horaEntrada || null,
      horaSalida: createAsistenciaDto.horaSalida || null,
    } as any) as unknown) as Asistencia;

    // Si tiene hora de entrada, calcular estado
    if (asistencia.horaEntrada) {
      await this.calcularEstadoAsistencia(asistencia, empleado);
    }

    return await this.asistenciaRepository.save(asistencia);
  }

  async update(id: number, updateAsistenciaDto: UpdateAsistenciaDto): Promise<Asistencia> {
    const asistencia = await this.asistenciaRepository.findOne({
      where: { id },
      relations: ['empleado'],
    });

    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }

    // Sanitizar campos de tiempo: cadenas vacías -> null
    const horaEntrada = updateAsistenciaDto.horaEntrada?.trim() || null;
    const horaSalida = updateAsistenciaDto.horaSalida?.trim() || null;

    // Costruir el objeto de actualización limpio
    const updateData: Partial<Asistencia> = {
      tipoRegistro: 'manual',
      estado: (updateAsistenciaDto.estado as any) ?? asistencia.estado,
      observaciones: updateAsistenciaDto.observaciones ?? asistencia.observaciones,
      horaEntrada: horaEntrada as any,
      horaSalida: horaSalida as any,
    };

    if (updateAsistenciaDto.minutosRetardo !== undefined) {
      updateData.minutosRetardo = updateAsistenciaDto.minutosRetardo;
    }

    await this.asistenciaRepository.update(id, updateData);

    // Devolver el registro actualizado
    return await this.asistenciaRepository.findOne({
      where: { id },
      relations: ['empleado'],
    }) as Asistencia;
  }

  async remove(id: number): Promise<void> {
    const result = await this.asistenciaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }
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

  async getStatsHoy() {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    const fechaInicio = new Date(hoyStr);
    const fechaFin = new Date(hoyStr);
    fechaFin.setHours(23, 59, 59, 999);

    // Ejecutar ambas consultas en paralelo
    const [asistencias, empleadosActivos] = await Promise.all([
      this.asistenciaRepository.find({
        where: { fecha: Between(fechaInicio, fechaFin) as any },
        select: ['id', 'estado'],  // Solo columnas necesarias
      }),
      this.empleadoRepository.count({ where: { estatus: 'activo' } }),
    ]);

    return {
      asistenciasHoy: asistencias.filter(a => a.estado === 'puntual' || a.estado === 'retardo').length,
      retardosHoy: asistencias.filter(a => a.estado === 'retardo').length,
      faltasHoy: asistencias.filter(a => a.estado === 'falta').length,
      empleadosActivos,
    };
  }

  async getStatsGraficas() {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 6);
    hace7Dias.setHours(0, 0, 0, 0);

    const asistencias = await this.asistenciaRepository.find({
      where: {
        fecha: Between(hace7Dias, hoy) as any,
      },
    });

    // 1. Gráfica Semanal
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const attendanceData: any[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(hace7Dias);
      d.setDate(hace7Dias.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      
      const asistenciasDia = asistencias.filter(a => 
        new Date(a.fecha).toISOString().split('T')[0] === dStr
      );

      attendanceData.push({
        name: diasSemana[d.getDay()],
        asistencia: asistenciasDia.filter(a => a.estado === 'puntual' || a.estado === 'retardo').length,
        faltas: asistenciasDia.filter(a => a.estado === 'falta').length,
      });
    }

    // 2. Gráfica de Puntualidad (histórico de los 7 días)
    const total = asistencias.length || 1;
    const puntualidadData = [
      { name: 'Puntual', value: Math.round((asistencias.filter(a => a.estado === 'puntual').length / total) * 100), color: '#10b981' },
      { name: 'Retardo', value: Math.round((asistencias.filter(a => a.estado === 'retardo').length / total) * 100), color: '#f59e0b' },
      { name: 'Falta', value: Math.round((asistencias.filter(a => a.estado === 'falta').length / total) * 100), color: '#ef4444' },
    ];

    return {
      attendanceData,
      puntualidadData,
    };
  }

  /**
   * Obtiene un reporte detallado con asistencias, permisos y vacaciones
   */
  async getReporteDetallado(fechaInicio: Date, fechaFin: Date) {
    // 4 consultas en paralelo en vez de secuenciales → 4x más rápido
    const [empleados, asistencias, vacaciones, permisos] = await Promise.all([
      this.empleadoRepository.find({ where: { estatus: 'activo' } }),
      this.asistenciaRepository.find({
        where: { fecha: Between(fechaInicio, fechaFin) as any },
        relations: ['empleado'],
      }),
      this.vacacionRepository.find({ where: { estado: 'aprobada' }, relations: ['empleado'] }),
      this.permisoRepository.find({ where: { autorizado: true }, relations: ['empleado'] }),
    ]);

    const data = empleados.map(emp => {
      const empAsist = asistencias.filter(a => a.empleadoId === emp.id);
      const empVac = vacaciones.filter(v => v.empleadoId === emp.id);
      const empPerm = permisos.filter(p => p.empleadoId === emp.id);

      let horasTotales = 0;
      empAsist.forEach(a => {
        horasTotales += this.calcularHorasTrabajadas(a.horaEntrada, a.horaSalida);
      });

      return {
        ...emp,
        asistencias: empAsist,
        stats: {
          puntuales: empAsist.filter(a => a.estado === 'puntual').length,
          retardos: empAsist.filter(a => a.estado === 'retardo').length,
          faltas: empAsist.filter(a => a.estado === 'falta').length,
          justificadas: empAsist.filter(a => a.estado === 'justificada').length,
          horasTrabajadas: +horasTotales.toFixed(2),
          vacaciones: empVac.length,
          permisos: empPerm.length,
        }
      };
    });

    return data;
  }
}
