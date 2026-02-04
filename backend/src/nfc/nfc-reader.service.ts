import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarjetaNfc } from '../tarjetas-nfc/tarjeta-nfc.entity';
import { AsistenciasService } from '../asistencias/asistencias.service';

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
  ) {}

  async onModuleInit() {
    // Inicializar la conexión serial al arrancar el módulo
    await this.conectarArduino();
  }

  /**
   * Conecta con el Arduino mediante puerto serial
   */
  async conectarArduino() {
    try {
      // Nota: Para que esto funcione, necesitas instalar 'serialport' con:
      // npm install serialport
      // Como no está instalado aún, dejamos el código preparado

      const SerialPort = require('serialport');
      const ReadlineParser = require('@serialport/parser-readline');

      const serialPath = this.configService.get('SERIAL_PORT') || 'COM3';
      const baudRate =
        parseInt(this.configService.get<string>('SERIAL_BAUD_RATE') || '9600') || 9600;

      this.port = new SerialPort.SerialPort({
        path: serialPath,
        baudRate: baudRate,
      });

      const parser = this.port.pipe(new ReadlineParser.ReadlineParser({ delimiter: '\n' }));

      this.port.on('open', () => {
        this.isConnected = true;
        this.logger.log(`✅ Conectado al Arduino en ${serialPath}`);
      });

      this.port.on('error', (err: any) => {
        this.logger.error(`❌ Error de conexión serial: ${err.message}`);
        this.isConnected = false;
      });

      // Escuchar datos del Arduino
      parser.on('data', async (data: string) => {
        await this.procesarLecturaNfc(data.trim());
      });
    } catch (error) {
      this.logger.warn(
        '⚠️  No se pudo conectar al Arduino. Asegúrate de que esté conectado y que serialport esté instalado.',
      );
      this.logger.warn(
        '   Ejecuta: npm install serialport @serialport/parser-readline',
      );
    }
  }

  /**
   * Procesa la lectura de una tarjeta NFC desde el Arduino
   */
  async procesarLecturaNfc(codigoNfc: string) {
    try {
      this.logger.log(`📱 Tarjeta NFC detectada: ${codigoNfc}`);

      // Buscar la tarjeta en la base de datos
      const tarjeta = await this.tarjetaRepository.findOne({
        where: { codigoNfc, activa: true },
        relations: ['empleado'],
      });

      if (!tarjeta) {
        this.logger.warn(`⚠️  Tarjeta ${codigoNfc} no encontrada o inactiva`);
        this.enviarRespuestaArduino('ERROR');
        return;
      }

      // Registrar asistencia
      const asistencia = await this.asistenciasService.registrarAsistencia(
        tarjeta.empleadoId,
        'normal',
      );

      this.logger.log(
        `✅ Asistencia registrada para ${tarjeta.empleado.nombre} ${tarjeta.empleado.apellidos}`,
      );
      this.logger.log(
        `   Estado: ${asistencia.estado} | Hora: ${asistencia.horaEntrada || asistencia.horaSalida}`,
      );

      // Enviar confirmación al Arduino (puede encender un LED verde o buzzer)
      this.enviarRespuestaArduino('OK');
    } catch (error) {
      this.logger.error(`❌ Error al procesar NFC: ${error.message}`);
      this.enviarRespuestaArduino('ERROR');
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
