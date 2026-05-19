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
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('empleados')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @Roles('administrador', 'supervisor')
  create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    return this.empleadosService.create(createEmpleadoDto);
  }

  @Get()
  @Roles('administrador', 'supervisor')
  findAll(@Query() pagination: PaginationDto) {
    return this.empleadosService.findAll(pagination);
  }

  @Get('activos')
  @Roles('administrador', 'supervisor')
  findActivos() {
    return this.empleadosService.findActivos();
  }

  @Get(':id')
  @Roles('administrador', 'supervisor')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador', 'supervisor')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
  ) {
    return this.empleadosService.update(id, updateEmpleadoDto);
  }

  @Patch(':id/desactivar')
  @Roles('administrador')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.deactivate(id);
  }

  @Delete(':id')
  @Roles('administrador')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.remove(id);
  }

  @Post(':id/upload-photo')
  @Roles('administrador', 'supervisor')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/empleados',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
          return cb(new Error('Solo se permiten archivos JPG o PNG'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ) {
    const fotoUrl = `/uploads/empleados/${file.filename}`;
    return this.empleadosService.update(id, { fotoUrl });
  }
}
