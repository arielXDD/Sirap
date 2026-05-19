import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BitacoraService } from '../../bitacora/bitacora.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly bitacoraService: BitacoraService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;

    // Solo auditar métodos que modifican datos
    const methodsToAudit = ['POST', 'PATCH', 'PUT', 'DELETE'];
    if (!methodsToAudit.includes(method)) {
      return next.handle();
    }

    // No auditar el login o acciones de bitacora para evitar bucles
    if (url.includes('/auth/login') || url.includes('/bitacora')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const tablaAfectada = url.split('/')[2] || 'desconocida';
          const registroId = data?.id || body?.id || null;

          // No usamos await para que la auditoría sea en "segundo plano" 
          // y no retrase el envío de la respuesta al cliente
          this.bitacoraService.create({
            usuarioId: user?.id,
            accion: method,
            tablaAfectada,
            registroId,
            datosNuevos: method !== 'DELETE' ? body : null,
            ipAddress: ip,
            motivo: body?.motivo || 'Cambio realizado desde el sistema',
          }).catch(error => {
            console.error('Error al grabar en bitácora (background):', error);
          });
        } catch (error) {
          console.error('Error al procesar datos para bitácora:', error);
        }
      }),
    );
  }
}
