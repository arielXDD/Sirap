import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Empleado } from '../empleados/empleado.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usuarioRepository = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  const empleadoRepository = app.get<Repository<Empleado>>(getRepositoryToken(Empleado));

  console.log('🚀 Iniciando script de recuperación de administrador...');

  try {
    // 1. Verificar/Crear Empleado Administrador
    let adminEmpleado = await empleadoRepository.findOne({ where: { numeroEmpleado: 'ADMIN001' } });
    
    if (!adminEmpleado) {
      console.log('📝 Creando empleado administrador...');
      adminEmpleado = empleadoRepository.create({
        numeroEmpleado: 'ADMIN001',
        nombre: 'Administrador',
        apellidos: 'del Sistema',
        puesto: 'Administrador TI',
        area: 'Tecnología',
        fechaIngreso: new Date(),
        estatus: 'activo'
      });
      await empleadoRepository.save(adminEmpleado);
      console.log('✅ Empleado administrador creado.');
    } else {
      console.log('ℹ️ Empleado administrador ya existe.');
    }

    // 2. Verificar/Crear Usuario
    const passwordHash = await bcrypt.hash('admin123', 10);
    let adminUser = await usuarioRepository.findOne({ where: { username: 'admin' } });

    if (!adminUser) {
      console.log('📝 Creando usuario administrador...');
      adminUser = usuarioRepository.create({
        username: 'admin',
        passwordHash: passwordHash,
        rol: 'administrador',
        empleadoId: adminEmpleado.id,
        activo: true
      });
    } else {
      console.log('📝 Actualizando contraseña de usuario administrador...');
      adminUser.passwordHash = passwordHash;
      adminUser.activo = true;
    }

    await usuarioRepository.save(adminUser);
    console.log('✅ Usuario administrador listo. Usuario: admin | Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
