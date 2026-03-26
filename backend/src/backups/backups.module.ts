import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Backup } from './backup.entity';
import { BackupsService } from './backups.service';
import { BackupsController } from './backups.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Backup]),
    MulterModule.register({ dest: './backups' }),
  ],
  providers: [BackupsService],
  controllers: [BackupsController],
  exports: [BackupsService],
})
export class BackupsModule {}

