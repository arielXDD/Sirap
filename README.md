# Sistema de Registro de Asistencia de Personal (SRAP)

Sistema completo de control y gestión de asistencia con integración de lector NFC Arduino, detección automática de retardos y faltas, y reportes personalizables.

## 🚀 Características Principales

### ✅ Gestión de Personal

- CRUD completo de empleados con validación
- Horarios variables por día de la semana
- Asignación de roles (Administrador, Supervisor, Empleado)

### 📱 Registro de Asistencia

- Registro automático mediante tarjetas NFC con Arduino
- Registro manual por administradores
- Detección automática de retardos considerando tolerancia
- Generación automática de faltas diarias
- Validación de vacaciones, permisos y días festivos

### 📊 Reportes

- Reporte diario de asistencias
- Resumen semanal con estadísticas
- Reporte mensual acumulado
- Exportación a PDF y Excel

### 🛡️ Seguridad

- Autenticación con JWT
- Control de acceso basado en roles
- Bitácora completa de auditoría

## 🏗️ Arquitectura

### Backend

- **Framework**: NestJS (TypeScript)
- **Base de Datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT + bcrypt
- **Integración NFC**: Puerto serial con Arduino

### Frontend

- **Framework**: Next.js 14+ (React con TypeScript)
- **Estado**: Zustand
- **Estilos**: CSS Modules personalizados
- **Formularios**: React Hook Form + Zod

### Hardware

- **Arduino**: Uno/Nano/Mega
- **Lector NFC**: MFRC522

## 📦 Instalación

### Prerequisitos

- Node.js 18+ y npm
- PostgreSQL 14+
- Arduino IDE (para programar el lector NFC)

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd srap
```

### 2. Configurar Base de Datos

Crear base de datos PostgreSQL:

```sql
CREATE DATABASE srap_db;
CREATE USER srap_user WITH ENCRYPTED PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE srap_db TO srap_user;
```

### 3. Configurar Backend

```bash
cd backend
npm install
```

Copiar el archivo `.env` y configurar las variables:

```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=srap_user
DB_PASSWORD=tu_password
DB_DATABASE=srap_db

# JWT
JWT_SECRET=clave_super_secreta_cambiar_en_produccion
JWT_EXPIRATION=24h

# Puerto Serial Arduino (verificar en Administrador de Dispositivos)
SERIAL_PORT=COM3
SERIAL_BAUD_RATE=9600
```

Iniciar servidor backend:

```bash
npm run start:dev
```

El servidor estará en: `http://localhost:3001/api`

### 4. Configurar Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Iniciar aplicación frontend:

```bash
npm run dev
```

La aplicación estará en: `http://localhost:3000`

### 5. Configurar Arduino NFC

Ver instrucciones detalladas en: [`arduino/README.md`](./arduino/README.md)

Resumen:

1. Conectar el módulo MFRC522 al Arduino según diagrama
2. Instalar biblioteca MFRC522 en Arduino IDE
3. Cargar el sketch `arduino/nfc_reader/nfc_reader.ino`
4. Conectar Arduino por USB al servidor
5. Verificar puerto COM y actualizar `.env` del backend

## 🗂️ Estructura del Proyecto

```
srap/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación JWT
│   │   ├── empleados/      # CRUD Empleados
│   │   ├── horarios/       # Horarios variables
│   │   ├── asistencias/    # Registro de asistencia
│   │   ├── tarjetas-nfc/   # Gestión tarjetas NFC
│   │   ├── vacaciones/     # Gestión vacaciones
│   │   ├── permisos/       # Permisos laborales
│   │   ├── dias-festivos/  # Calendario festivo
│   │   ├── usuarios/       # Usuarios del sistema
│   │   ├── bitacora/       # Auditoría
│   │   ├── nfc/            # Servicio lector NFC
│   │   └── reportes/       # Generación reportes
│   └── .env                # Variables de entorno
├── frontend/               # Aplicación Next.js
│   ├── app/
│   │   ├── login/         # Página de inicio de sesión
│   │   ├── dashboard/     # Panel principal
│   │   ├── empleados/     # Gestión empleados
│   │   ├── asistencias/   # Registro asistencia
│   │   └── reportes/      # Reportes
│   └── components/        # Componentes reutilizables
└── arduino/               # Código Arduino
    ├── nfc_reader/
    │   └── nfc_reader.ino # Sketch Arduino
    └── README.md          # Instrucciones hardware
```

## 🔐 Usuarios por Defecto

El sistema requiere crear un usuario administrador inicial directamente en la base de datos.

### Crear Usuario Administrador

**IMPORTANTE**: Las dependencias faltantes deben instalarse primero en el backend:

```bash
cd backend
npm install bcrypt @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt class-validator class-transformer
npm install --save-dev @types/bcrypt @types/passport-jwt
```

Luego crear usuario:

```sql
-- Primero crear un empleado
INSERT INTO empleados (numero_empleado, nombre, apellidos, puesto, area, fecha_ingreso, estatus)
VALUES ('ADMIN001', 'Administrador', 'Sistema', 'Administrador', 'TI', '2026-01-01', 'activo');

-- Luego crear el usuario (password hasheado de "admin123")
INSERT INTO usuarios (username, password_hash, rol, empleado_id, activo)
VALUES ('admin', '$2b$10$K5z8qZY.xB0YvJ4BQvH7/ujK8F.2hI7MzREp/pVYQfLg3xP7s4Yju', 'administrador',
        (SELECT id FROM empleados WHERE numero_empleado = 'ADMIN001'), true);
```

**Credenciales de acceso:**

- Usuario: `admin`
- Contraseña: `admin123`

⚠️ **CAMBIAR LA CONTRASEÑA INMEDIATAMENTE DESPUÉS DEL PRIMER ACCESO**

## 📋 Uso del Sistema

### 1. Iniciar Sesión

Acceder a `http://localhost:3000/login` e ingresar credenciales.

### 2. Registrar Empleados

1. Ir a **Empleados** → **Nuevo Empleado**
2. Completar formulario
3. Guardar

### 3. Asignar Horarios

1. Seleccionar empleado
2. Ir a **Horarios** → **Nuevo Horario**
3. Configurar horarios por día de la semana
4. Establecer tolerancia de retardo

### 4. Asignar Tarjeta NFC

1. Ir a **Tarjetas NFC** → **Nueva Tarjeta**
2. Seleccionar empleado
3. Acercar tarjeta NFC al lector Arduino
4. Sistema captura automáticamente el código UID
5. Guardar asignación

### 5. Registrar Asistencia

**Modo Automático (NFC)**:

- Empleado acerca su tarjeta al lector
- Sistema registra automáticamente entrada/salida
- LED verde: registro exitoso
- LED rojo: error o tarjeta no registrada

**Modo Manual**:

- Administrador/Supervisor ingresa a **Asistencias**
- Selecciona empleado y registra entrada/salida manualmente

### 6. Gestionar Vacaciones y Permisos

1. Ir a **Vacaciones** o **Permisos**
2. Crear nueva solicitud
3. Aprobar/Rechazar (solo administradores)

### 7. Generar Reportes

1. Ir a **Reportes**
2. Seleccionar tipo (Diario, Semanal, Mensual)
3. Definir rango de fechas
4. Exportar en PDF o Excel

## ⚙️ Configuración Avanzada

### Generación Automática de Faltas

El sistema puede generar faltas automáticamente. Para ejecutarlo diariamente, configurar un cron job o tarea programada:

**Endpoint**: `POST /api/asistencias/generar-faltas`

**Windows Task Scheduler**:

```bash
curl -X POST http://localhost:3001/api/asistencias/generar-faltas -H "Authorization: Bearer {TOKEN}"
```

Ejecutar diariamente a las 23:55

### Personalización de Tolerancias

Las tolerancias de retardo se configuran por empleado y día en el módulo de **Horarios**.

## 🐛 Solución de Problemas

### Backend no se conecta a PostgreSQL

- Verificar que PostgreSQL esté ejecutándose
- Revisar credenciales en `.env`
- Verificar que la base de datos existe

### Arduino no detecta tarjetas NFC

- Verificar conexiones del MFRC522
- Abrir Monitor Serial (9600 baud) para ver logs
- Asegurarse de usar tarjetas MIFARE compatibles

### Frontend no se conecta al backend

- Verificar que backend esté en puerto 3001
- Revisar `NEXT_PUBLIC_API_URL` en `.env.local`
- Verificar CORS habilitado en backend

### NFC no registra asistencias

- Verificar puerto COM correcto en `.env` del backend
- Revisar que la tarjeta esté asignada a un empleado
- Ver logs del backend para errores de conexión serial

## 📝 API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión

### Empleados

- `GET /api/empleados` - Listar empleados
- `POST /api/empleados` - Crear empleado
- `GET /api/empleados/:id` - Obtener empleado
- `PATCH /api/empleados/:id` - Actualizar empleado
- `DELETE /api/empleados/:id` - Eliminar empleado

### Asistencias

- `POST /api/asistencias/registrar/:empleadoId` - Registrar asistencia
- `GET /api/asistencias/empleado/:id` - Asistencias de empleado
- `GET /api/asistencias/fecha/:fecha` - Asistencias por fecha
- `POST /api/asistencias/generar-faltas` - Generar faltas automáticas

_(Ver documentación completa de API en `/api/docs` cuando esté habilitado Swagger)_

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crear un fork
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es de uso privado para la organización.

## 👥 Soporte

Para soporte técnico, contactar al área de TI.

---

**Desarrollado con ❤️ para optimizar la gestión de asistencia laboral**
