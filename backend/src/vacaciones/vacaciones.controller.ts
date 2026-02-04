import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VacacionesService } from './vacaciones.service';
import { CreateVacacionDto } from './dto/create-vacacion.dto';
import { UpdateVacacionDto } from './dto/update-vacacion.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('vacaciones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VacacionesController {
  constructor(private readonly vacacionesService: VacacionesService) {}

  @Post()
  @Roles('administrador', 'supervisor', 'empleado')
  create(@Body() createVacacionDto: CreateVacacionDto) {
    return this.vacacionesService.create(createVacacionDto);
  }

  @Get()
  @Roles('administrador', 'supervisor')
  findAll() {
    return this.vacacionesService.findAll();
  }

  @Get('pendientes')
  @Roles('administrador', 'supervisor')
  findPendientes() {
    return this.vacacionesService.findPendientes();
  }

  @Get('empleado/:id')
  @Roles('administrador', 'supervisor', 'empleado')
  findByEmpleado(@Param('id', ParseIntPipe) id: number) {
    return this.vacacionesService.findByEmpleado(id);
  }

  @Get(':id')
  @Roles('administrador', 'supervisor', 'empleado')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vacacionesService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'supervisor')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVacacionDto: UpdateVacacionDto,
  ) {
    return this.vacacionesService.update(id, updateVacacionDto);
  }

  @Patch(':id/aprobar')
  @Roles('administrador')
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.vacacionesService.aprobar(id);
  }

  @Patch(':id/rechazar')
  @Roles('administrador')
  rechazar(@Param('id', ParseIntPipe) id: number) {
    return this.vacacionesService.rechazar(id);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vacacionesService.remove(id);
  }
}
