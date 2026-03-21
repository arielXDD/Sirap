import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarjetaNfc } from '../tarjetas-nfc/tarjeta-nfc.entity';
import { AsistenciasService } from '../asistencias/asistencias.service';
import { NfcGateway } from './nfc.gateway';

@Injectable()
export class NfcReaderService implements OnModuleInit {
  private readonly logger = new Logger(NfcReaderService.name);
  private port: any;
  private isConnected = false;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TarjetaNfc)
    private readonly tarjetaRepository: Repository<TarjetaNfc>,
    private readonly asistenciasService: AsistenciasService,
    private readonly nfcGateway: NfcGateway,
  ) {}

  async onModuleInit() {
    this.logger.log('📡 Modo WiFi activo. Lector NFC listo para recibir datos.');
  }

  /**
   * Conecta con el Arduino mediante puerto serial
   */
  async conectarArduino() {
    // Desactivado en favor de WiFi para evitar errores de puerto ocupado
  }

  /**
   * Procesa la lectura de una tarjeta NFC
   */
  async procesarLecturaNfc(codigoNfc: string): Promise<{ success: boolean; message: string; empleado?: string; tipo?: string }> {
    try {
      this.logger.log(`📱 Tarjeta NFC detectada: ${codigoNfc}`);

      // Notificar al frontend en tiempo real vía WebSocket
      this.nfcGateway.emitirLectura(codigoNfc);

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
   * Envía una respuesta al Arduino
   */
  private enviarRespuestaArduino(mensaje: string) {
    if (this.isConnected && this.port) {
      this.port.write(`${mensaje}\n`);
    }
  }

  /**
   * Obtiene el estado de la conexión
   */
  getEstadoConexion() {
    return {
      conectado: this.isConnected,
      puerto: this.configService.get('SERIAL_PORT') || 'COM3',
    };
  }
}
