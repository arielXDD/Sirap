import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'nfc',
})
export class NfcGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NfcGateway');

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  emitirLectura(codigoNfc: string) {
    this.server.emit('nfc_reading', { codigoNfc });
  }

  emitirRegistro(datos: any) {
    this.server.emit('asistencia_registrada', datos);
  }

  /**
   * Recibe una alerta de actualización de cualquier cliente (ej: una pestaña borró algo)
   * y se lo notifica a todos los demás.
   */
  @SubscribeMessage('solicitar_actualizacion')
  broadcastActualizacion(@MessageBody() data: any) {
    this.server.emit('asistencia_registrada', { ...data, refresh: true });
  }
}
