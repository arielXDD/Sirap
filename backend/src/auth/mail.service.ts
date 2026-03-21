import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: +this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"SRAP System" <${this.configService.get('MAIL_FROM')}>`,
      to,
      subject: 'Recuperación de Contraseña - SRAP',
      html: this.getTemplate('Recuperación de Contraseña', `
        <p>Has solicitado restablecer tu contraseña en el sistema SRAP. Haz clic en el siguiente botón para continuar:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #1e3a5f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
        </div>
        <p>Este enlace es válido por 15 minutos.</p>
      `),
    };

    await this.send(mailOptions);
  }

  async sendUnlockCode(to: string, code: string) {
    const mailOptions = {
      from: `"SRAP System Seguridad" <${this.configService.get('MAIL_FROM')}>`,
      to,
      subject: 'Código de Desbloqueo de Cuenta - SRAP',
      html: this.getTemplate('Bloqueo de Seguridad', `
        <p>Tu cuenta de administrador ha sido bloqueada tras 5 intentos fallidos.</p>
        <p>Utiliza el siguiente código para desbloquear tu acceso:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f1f5f9; color: #1e3a5f; padding: 15px 30px; font-size: 24px; font-weight: 800; border: 2px dashed #cbd5e1; letter-spacing: 5px;">
            ${code}
          </span>
        </div>
        <p>Este código es válido por 30 minutos.</p>
        <p>Si no fuiste tú, te recomendamos cambiar tu contraseña de inmediato.</p>
      `),
    };

    await this.send(mailOptions);
  }

  private getTemplate(title: string, content: string) {
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 0;">
        <div style="border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
          <h1 style="color: #1e3a5f; margin: 0; letter-spacing: 2px;">SIRAP</h1>
          <p style="color: #64748b; font-size: 0.8rem; text-transform: uppercase; margin: 5px 0 0;">${title}</p>
        </div>
        <div style="color: #334155; line-height: 1.6; font-size: 1rem;">
          ${content}
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">
          Este es un correo automático de seguridad del sistema SRAP. Por favor no respondas.
        </p>
      </div>
    `;
  }

  private async send(options: any) {
    try {
      await this.transporter.sendMail(options);
    } catch (error) {
      console.error('Error sending email:', error);
      // No lanzamos error para que el flujo de simulación de la UI funcione si no hay SMTP configurado
    }
  }
}
