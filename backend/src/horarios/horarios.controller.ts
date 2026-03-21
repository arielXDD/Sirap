import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('horarios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  @Roles('administrador')
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horariosService.create(createHorarioDto);
  }

  @Get()
  @Roles('administrador', 'supervisor')
  findAll() {
    return this.horariosService.findAll();
  }

  @Get('empleado/:empleadoId')
  @Roles('administrador', 'supervisor', 'empleado')
  findByEmpleado(@Param('empleadoId', ParseIntPipe) empleadoId: number) {
    return this.horariosService.findByEmpleado(empleadoId);
  }

  @Get(':id')
  @Roles('administrador', 'supervisor')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.horariosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateHorarioDto: UpdateHorarioDto) {
    return this.horariosService.update(id, updateHorarioDto);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.horariosService.remove(id);
  }
}
