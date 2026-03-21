import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Request, Query } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('permisos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Post()
  @Roles('administrador', 'supervisor', 'empleado')
  create(@Body() createPermisoDto: CreatePermisoDto) {
    return this.permisosService.create(createPermisoDto);
  }

  @Get()
  @Roles('administrador', 'supervisor')
  findAll(@Query() pagination: PaginationDto) {
    return this.permisosService.findAll(pagination);
  }

  @Get('empleado/:empleadoId')
  @Roles('administrador', 'supervisor', 'empleado')
  findByEmpleado(@Param('empleadoId', ParseIntPipe) empleadoId: number) {
    return this.permisosService.findByEmpleado(empleadoId);
  }

  @Get(':id')
  @Roles('administrador', 'supervisor', 'empleado')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permisosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'supervisor')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePermisoDto: UpdatePermisoDto) {
    return this.permisosService.update(id, updatePermisoDto);
  }

  @Patch(':id/autorizar')
  @Roles('administrador')
  authorize(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.permisosService.authorize(id, req.user.id);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permisosService.remove(id);
  }
}
