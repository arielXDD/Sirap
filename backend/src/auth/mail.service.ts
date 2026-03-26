import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private isConfigured = false;
  private fromAddress: string;

  constructor(private configService: ConfigService) {
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');
    this.fromAddress = this.configService.get<string>('MAIL_FROM') || user || '';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('MAIL_HOST') || 'smtp.gmail.com',
        port: +(this.configService.get('MAIL_PORT') || 587),
        secure: this.configService.get('MAIL_SECURE') === 'true',
        auth: { user, pass },
      });
      this.isConfigured = true;
      this.logger.log(`[Mail] Gmail SMTP configurado: ${user} ✓`);
    } else {
      this.logger.warn('[Mail] MAIL_USER / MAIL_PASS no configurados. Modo DEMO activo.');
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<{ sent: boolean; preview?: string }> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    if (!this.isConfigured) {
      this.logger.warn(`[Mail DEMO] Reset link para ${to}: ${resetLink}`);
      return { sent: false, preview: resetLink };
    }

    try {
      await this.transporter.sendMail({
        from: `"SIRAP Sistema" <${this.fromAddress}>`,
        to,
        subject: 'Recuperación de Contraseña — SIRAP',
        html: this.getTemplate('Recuperación de Contraseña', `
          <p>Has solicitado restablecer tu contraseña en el sistema <strong>SIRAP</strong>.</p>
          <p>Haz clic en el siguiente botón para continuar:</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetLink}"
              style="background:#1e3a5f;color:#fff;padding:14px 30px;text-decoration:none;
                     border-radius:6px;font-weight:700;font-size:1rem;display:inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color:#64748b;font-size:0.875rem;">Este enlace es válido por <strong>15 minutos</strong>.</p>
          <p style="color:#64748b;font-size:0.875rem;">Si no solicitaste este cambio, ignora este correo.</p>
        `),
      });
      this.logger.log(`[Mail] Reset email enviado a ${to} ✓`);
      return { sent: true };
    } catch (error) {
      this.logger.error(`[Mail] Error: ${error.message}`);
      return { sent: false, preview: resetLink };
    }
  }

  async sendUnlockCode(to: string, code: string): Promise<{ sent: boolean }> {
    if (!this.isConfigured) {
      this.logger.warn(`[Mail DEMO] Código de desbloqueo para ${to}: ${code}`);
      return { sent: false };
    }

    try {
      await this.transporter.sendMail({
        from: `"SIRAP Seguridad" <${this.fromAddress}>`,
        to,
        subject: '🔐 Código de Desbloqueo de Cuenta — SIRAP',
        html: this.getTemplate('Alerta de Seguridad', `
          <p>Tu cuenta de <strong>administrador SIRAP</strong> fue bloqueada tras 5 intentos fallidos de inicio de sesión.</p>
          <p>Utiliza el siguiente código para desbloquear tu acceso:</p>
          <div style="text-align:center;margin:32px 0;">
            <div style="display:inline-block;background:#f1f5f9;border:2px dashed #94a3b8;
                        padding:18px 40px;border-radius:8px;">
              <span style="font-size:2.5rem;font-weight:900;letter-spacing:10px;
                           color:#1e3a5f;font-family:monospace;">${code}</span>
            </div>
          </div>
          <p style="color:#64748b;font-size:0.875rem;">Este código es válido por <strong>30 minutos</strong>.</p>
          <p style="color:#ef4444;font-size:0.875rem;">
            ⚠️ Si no fuiste tú, cambia tu contraseña de inmediato.
          </p>
        `),
      });
      this.logger.log(`[Mail] Código de desbloqueo enviado a ${to} ✓`);
      return { sent: true };
    } catch (error) {
      this.logger.error(`[Mail] Error enviando unlock code: ${error.message}`);
      return { sent: false };
    }
  }

  private getTemplate(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                     style="background:#fff;border:1px solid #e2e8f0;max-width:600px;width:100%;">
                <!-- Cabecera -->
                <tr>
                  <td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:1.9rem;letter-spacing:4px;font-weight:900;">SIRAP</h1>
                    <p style="color:#93c5fd;margin:6px 0 0;font-size:0.75rem;
                               text-transform:uppercase;letter-spacing:3px;">${title}</p>
                  </td>
                </tr>
                <!-- Cuerpo -->
                <tr>
                  <td style="padding:36px 40px;color:#334155;font-size:0.95rem;line-height:1.7;">
                    ${content}
                  </td>
                </tr>
                <!-- Pie -->
                <tr>
                  <td style="background:#f1f5f9;padding:18px 40px;text-align:center;
                              border-top:1px solid #e2e8f0;">
                    <p style="color:#94a3b8;font-size:0.72rem;margin:0;">
                      Correo automático del Sistema SIRAP &mdash; No respondas a este mensaje.
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `;
  }
}
