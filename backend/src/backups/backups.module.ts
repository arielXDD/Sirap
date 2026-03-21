import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Backup } from './backup.entity';
import { BackupsService } from './backups.service';
import { BackupsController } from './backups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Backup])],
  providers: [BackupsService],
  controllers: [BackupsController],
  exports: [BackupsService],
})
export class BackupsModule {}
