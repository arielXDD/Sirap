import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { NfcModule } from './nfc/nfc.module';
import { TarjetasNfcModule } from './tarjetas-nfc/tarjetas-nfc.module';
import { VacacionesModule } from './vacaciones/vacaciones.module';
import { HorariosModule } from './horarios/horarios.module';
import { PermisosModule } from './permisos/permisos.module';
import { DiasFestivosModule } from './dias-festivos/dias-festivos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { BackupsModule } from './backups/backups.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [

    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // Rate limiting global (60 req/min por defecto)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    // Módulos de la aplicación
    ScheduleModule.forRoot(),
    AuthModule,
    EmpleadosModule,
    AsistenciasModule,
    NfcModule,
    TarjetasNfcModule,
    VacacionesModule,
    HorariosModule,
    PermisosModule,
    DiasFestivosModule,
    UsuariosModule,
    BitacoraModule,
    BackupsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
