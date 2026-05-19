import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: any;
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken && accountSid.startsWith('AC')) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Twilio = require('twilio');
        this.twilioClient = new Twilio(accountSid, authToken);
        this.isConfigured = true;
        this.logger.log('[SMS] Twilio configurado correctamente');
      } catch (e) {
        this.logger.warn('[SMS] Twilio no encontrado. Ejecuta: npm install twilio');
      }
    } else {
      this.logger.warn('[SMS] Twilio no configurado. Define TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN en .env');
    }
  }

  async sendUnlockCode(phone: string, code: string): Promise<{ sent: boolean; preview?: string }> {
    const message = `SIRAP - Código de desbloqueo: ${code}\nVigente 30 minutos. Si no fuiste tú, cambia tu contraseña.`;

    if (!this.isConfigured) {
      this.logger.warn(`[SMS DEMO] Mensaje a ${phone}: ${message}`);
      return { sent: false, preview: `[SMS DEMO] → ${phone}: "${code}"` };
    }

    try {
      const from = this.configService.get('TWILIO_FROM_NUMBER');
      await this.twilioClient.messages.create({
        body: message,
        from,
        to: phone,
      });
      this.logger.log(`[SMS] Código enviado a ${phone}`);
      return { sent: true };
    } catch (error) {
      this.logger.error(`[SMS] Error enviando a ${phone}: ${error.message}`);
      return { sent: false, preview: `[DEMO → ${phone}]: ${code}` };
    }
  }

  async sendPasswordResetSms(phone: string, token: string): Promise<{ sent: boolean; preview?: string }> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const message = `SIRAP - Restablece tu contraseña: ${resetLink}\nVigente 15 minutos.`;

    if (!this.isConfigured) {
      this.logger.warn(`[SMS DEMO] Mensaje a ${phone}: ${message}`);
      return { sent: false, preview: resetLink };
    }

    try {
      const from = this.configService.get('TWILIO_FROM_NUMBER');
      await this.twilioClient.messages.create({ body: message, from, to: phone });
      return { sent: true };
    } catch (error) {
      this.logger.error(`[SMS] Error: ${error.message}`);
      return { sent: false, preview: resetLink };
    }
  }
}
