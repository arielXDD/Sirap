# 🚀 Guía de Inicio Rápido - SRAP

Este documento te guiará paso a paso para poner en funcionamiento el Sistema de Registro de Asistencia.

## ✅ Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✓ Node.js 18+ ([descargar](https://nodejs.org/))
- ✓ PostgreSQL 14+ ([descargar](https://www.postgresql.org/download/))
- ✓ Arduino IDE ([descargar](https://www.arduino.cc/en/software)) - solo si usarás NFC

## 📦 Paso 1: Instalar Dependencias Backend

Abre una terminal en `srap/backend`:

```bash
cd c:\Users\Ariel\Documents\srap\backend
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/typeorm passport passport-jwt bcrypt class-validator class-transformer typeorm pg
npm install --save-dev @types/passport-jwt @types/bcrypt
```

**Opcional** - Para NFC y reportes:

```bash
npm install serialport pdfkit exceljs winston
npm install --save-dev @types/pdfkit
```

## 📦 Paso 2: Instalar Dependencias Frontend

Abre otra terminal en `srap/frontend`:

```bash
cd c:\Users\Ariel\Documents\srap\frontend
```

Ya está instalado Next.js. No necesitas instalar nada más de momento.

## 🗄️ Paso 3: Configurar Base de Datos

### 3.1 Crear Base de Datos

Abre **pgAdmin** o **psql** y ejecuta:

```sql
CREATE DATABASE srap_db;
```

### 3.2 Configurar Variables de Entorno

Edita el archivo `backend/.env` con tus credenciales de PostgreSQL:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=ariel117.2
DB_DATABASE=srap_db

JWT_SECRET=clave_super_secreta_cambiar_en_produccion
JWT_EXPIRATION=24h

SERIAL_PORT=COM3
SERIAL_BAUD_RATE=9600
```

**IMPORTANTE**: Cambia `DB_PASSWORD` por tu contraseña de PostgreSQL.

## 🚀 Paso 4: Iniciar el Backend

En la terminal de `backend`:

```bash
npm run start:dev
```

Deberías ver:

```
🚀 Servidor ejecutándose en http://localhost:3001/api
```

**La primera vez, TypeORM creará automáticamente todas las tablas** en la base de datos.

## 👤 Paso 5: Crear Usuario Administrador

Ejecuta el script SQL en `database/init.sql` O ejecuta estos comandos en pgAdmin/psql:

```sql
-- Crear empleado administrador
INSERT INTO empleados (numero_empleado, nombre, apellidos, puesto, area, fecha_ingreso, estatus, "creadoEn", "actualizadoEn")
VALUES ('ADMIN001', 'Administrador', 'del Sistema', 'Administrador TI', 'Tecnología', '2026-01-28', 'activo', NOW(), NOW());

-- Crear usuario (contraseña: admin123)
INSERT INTO usuarios (username, "passwordHash", rol, "empleadoId", activo, "creadoEn", "actualizadoEn")
SELECT
    'admin',
    '$2b$10$K5z8qZY.xB0YvJ4BQvH7/ujK8F.2hI7MzREp/pVYQfLg3xP7s4Yju',
    'administrador',
    (SELECT id FROM empleados WHERE numero_empleado = 'ADMIN001'),
    true,
    NOW(),
    NOW();
```

## 🎨 Paso 6: Iniciar el Frontend

En la terminal de `frontend`:

```bash
npm run dev
```

Deberías ver:

```
✓ Ready in X ms
Local: http://localhost:3000
```

## 🎉 Paso 7: Acceder al Sistema

1. Abre tu navegador
2. Ve a: http://localhost:3000
3. Inicia sesión con:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

¡Listo! Ahora estás en el dashboard.

## 📋 Próximos Pasos

### Registrar Empleados

1. Ve a **Empleados** en el menú lateral
2. Haz clic en "Nuevo Empleado"
3. Completa el formulario
4. Guarda

### Configurar Horarios

1. Selecciona un empleado
2. Ve a "Horarios"
3. Agrega horarios por cada día de la semana
4. Define la tolerancia de retardo (en minutos)

### Configurar Arduino NFC (Opcional)

Si tienes el lector NFC Arduino:

1. Sigue las instrucciones en `arduino/README.md`
2. Ve al **Administrador de Dispositivos** de Windows
3. Encuentra el puerto COM del Arduino (ej: COM3)
4. Actualiza `SERIAL_PORT` en `backend/.env`
5. Reinicia el backend

### Registrar Tarjetas NFC

1. Ve a **Tarjetas NFC** en el menú
2. Selecciona un empleado
3. Acerca la tarjeta al lector Arduino
4. El sistema capturará automáticamente el código UID
5. Guarda la asignación

## 🔧 Solución de Problemas Comunes

### El backend no arranca

**Error: "Cannot find module"**

```bash
cd backend
npm install
```

**Error: "Connection to database failed"**

- Verifica que PostgreSQL esté ejecutándose
- Revisa las credenciales en `.env`
- Asegúrate de que la base de datos `srap_db` existe

### El frontend no se conecta al backend

**Error: "Failed to fetch"**

- Verifica que el backend esté ejecutándose en puerto 3001
- Revisa que `.env.local` tiene la URL correcta:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3001/api
  ```

### No puedo iniciar sesión

**"Credenciales inválidas"**

- Verifica que ejecutaste el script SQL para crear el usuario admin
- Asegúrate de usar usuario: `admin` y contraseña: `admin123`
- Revisa la consola del backend para ver errores de JWT

### Arduino no detecta tarjetas

- Verifica las conexiones del MFRC522
- Abre el Monitor Serial (9600 baud) en Arduino IDE
- Deberías ver "Lector NFC iniciado..."
- Acerca una tarjeta MIFARE compatible

## 📞 ¿Necesitas Ayuda?

- Revisa el `README.md` principal para documentación completa
- Consulta `arduino/README.md` para problemas con el hardware NFC
- Revisa los logs del backend en la terminal para errores específicos

---

**¡Felicidades! Tu sistema de asistencia está listo para usar.** 🎊
