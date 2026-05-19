import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarjetaNfc } from '../tarjetas-nfc/tarjeta-nfc.entity';
import { AsistenciasService } from '../asistencias/asistencias.service';

@Injectable()
export class NfcReaderService implements OnModuleInit {
  private readonly logger = new Logger(NfcReaderService.name);

  constructor(
    @InjectRepository(TarjetaNfc)
    private readonly tarjetaRepository: Repository<TarjetaNfc>,
    private readonly asistenciasService: AsistenciasService,
  ) {}

  async onModuleInit() {
    this.logger.log('📡 Modo Lector NFC USB Activo. Listo para recibir lecturas del sitio.');
  }

  /**
   * Procesa la lectura de una tarjeta NFC (enviada desde la interfaz web o un cliente externo)
   */
  async procesarLecturaNfc(codigoNfc: string): Promise<{ success: boolean; message: string; empleado?: string; tipo?: string }> {
    try {
      this.logger.log(`📱 Tarjeta NFC detectada: ${codigoNfc}`);

      // Buscar la tarjeta en la base de datos
      const tarjeta = await this.tarjetaRepository.findOne({
        where: { codigoNfc, activa: true },
        relations: ['empleado'],
      });

      if (!tarjeta) {
        this.logger.warn(`⚠️  Tarjeta ${codigoNfc} no encontrada o inactiva`);
        return { success: false, message: 'ERROR' };
      }

      // Registrar asistencia
      const asistencia = await this.asistenciasService.registrarAsistencia(
        tarjeta.empleadoId,
        'normal',
      );

      const nombreCompleto = `${tarjeta.empleado.nombre} ${tarjeta.empleado.apellidos}`;
      const tipo = asistencia.horaSalida ? 'salida' : 'entrada';

      this.logger.log(
        `✅ Asistencia registrada para ${nombreCompleto}`,
      );
      this.logger.log(
        `   Estado: ${asistencia.estado} | Hora: ${asistencia.horaEntrada || asistencia.horaSalida}`,
      );

      return { success: true, message: 'OK', empleado: nombreCompleto, tipo };
    } catch (error) {
      this.logger.error(`❌ Error al procesar NFC: ${error.message}`);
      return { success: false, message: error.message || 'ERROR' };
    }
  }

  /**
   * Obtiene el estado del lector NFC
   */
  getEstadoConexion() {
    return {
      conectado: true,
      tipo: 'Lector NFC USB Externo (Emulación de Teclado / Código de Barras)',
    };
  }
}
