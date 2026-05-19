import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { Usuario } from '../usuarios/usuario.entity';
import { TarjetaNfc } from '../tarjetas-nfc/tarjeta-nfc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, TarjetaNfc])],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
