import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfcReaderService } from './nfc-reader.service';
import { NfcController } from './nfc.controller';
import { TarjetaNfc } from '../tarjetas-nfc/tarjeta-nfc.entity';
import { AsistenciasModule } from '../asistencias/asistencias.module';

@Module({
  imports: [TypeOrmModule.forFeature([TarjetaNfc]), AsistenciasModule],
  controllers: [NfcController],
  providers: [NfcReaderService],
  exports: [NfcReaderService],
})
export class NfcModule {}
