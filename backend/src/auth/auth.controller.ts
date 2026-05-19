import { Controller, Post, Body, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('forgot-password-sms')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordSms(@Body() body: { email: string }) {
    return this.authService.requestPasswordResetSms(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  // ── Desbloqueo ─────────────────────────────────────────────
  @Post('unlock-admin')
  @HttpCode(HttpStatus.OK)
  async unlockAdmin(@Body() body: { username: string; code: string }) {
    return this.authService.verifyUnlockCode(body.username, body.code);
  }

  @Post('unlock-user/:id')
  @HttpCode(HttpStatus.OK)
  async unlockUser(@Param('id') id: string, @Body('adminId') adminId: number) {
    return this.authService.unlockUser(+id, adminId);
  }
}
