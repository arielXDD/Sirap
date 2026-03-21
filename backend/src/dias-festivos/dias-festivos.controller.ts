import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { DiasFestivosService } from './dias-festivos.service';
import { CreateDiaFestivoDto } from './dto/create-dia-festivo.dto';
import { UpdateDiaFestivoDto } from './dto/update-dia-festivo.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dias-festivos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DiasFestivosController {
  constructor(private readonly diasFestivosService: DiasFestivosService) {}

  @Post()
  @Roles('administrador')
  create(@Body() createDiaFestivoDto: CreateDiaFestivoDto) {
    return this.diasFestivosService.create(createDiaFestivoDto);
  }

  @Get()
  @Roles('administrador', 'supervisor', 'empleado')
  findAll(@Query() pagination: PaginationDto) {
    return this.diasFestivosService.findAll(pagination);
  }

  @Get(':id')
  @Roles('administrador', 'supervisor')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.diasFestivosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDiaFestivoDto: UpdateDiaFestivoDto) {
    return this.diasFestivosService.update(id, updateDiaFestivoDto);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.diasFestivosService.remove(id);
  }
}
