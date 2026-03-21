import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bitacora } from './bitacora.entity';
import { BitacoraService } from './bitacora.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bitacora])],
  providers: [BitacoraService],
  exports: [BitacoraService],
})
export class BitacoraModule {}
