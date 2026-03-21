import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar body parser para datos de formulario (Arduino envía urlencoded)
  app.use(express.urlencoded({ extended: true }));

  // Servir archivos estáticos de uploads (fotos de empleados, etc.)
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,      // ← Cambiado: No descartar campos sin decoradores
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Habilitar CORS para el frontend y el lector ESP32
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor ejecutándose en http://0.0.0.0:${port}/api`);
}
bootstrap();
