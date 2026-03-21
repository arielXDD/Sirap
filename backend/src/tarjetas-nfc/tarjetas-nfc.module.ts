import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarjetaNfc } from './tarjeta-nfc.entity';
import { TarjetasNfcService } from './tarjetas-nfc.service';
import { TarjetasNfcController } from './tarjetas-nfc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TarjetaNfc])],
  controllers: [TarjetasNfcController],
  providers: [TarjetasNfcService],
  exports: [TarjetasNfcService],
})
export class TarjetasNfcModule {}
