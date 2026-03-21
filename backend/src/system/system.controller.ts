import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Post('restart')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('administrador')
  async restart(@Request() req, @Body() body: { password: string; nfcUID: string }) {
    return this.systemService.restartServer(req.user.id, body.password, body.nfcUID);
  }
}
