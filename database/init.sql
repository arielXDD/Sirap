-- ================================================
-- Script de Inicialización de Base de Datos SRAP
-- Sistema de Registro de Asistencia de Personal
-- ================================================

-- Eliminar base de datos si existe (¡CUIDADO EN PRODUCCIÓN!)
-- DROP DATABASE IF EXISTS sirap;

-- Crear base de datos
CREATE DATABASE sirap
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Mexico.1252'
    LC_CTYPE = 'Spanish_Mexico.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE sirap IS 'Sistema de Registro de Asistencia de Personal';

-- Conectar a la base de datos
\c sirap

-- ================================================
-- Las tablas se crearán automáticamente por TypeORM
-- cuando ejecutes el backend en modo development
-- ================================================

-- ================================================
-- Datos Iniciales
-- ================================================

-- Script para crear usuario administrador inicial
-- PRIMERO debes ejecutar el backend para que cree las tablas

-- Crear empleado administrador
INSERT INTO empleados (numero_empleado, nombre, apellidos, puesto, area, fecha_ingreso, estatus, "creadoEn", "actualizadoEn")
VALUES ('ADMIN001', 'Administrador', 'del Sistema', 'Administrador TI', 'Tecnología', '2026-01-28', 'activo', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Crear usuario admin (contraseña: admin124, hash bcrypt rounds=10)
INSERT INTO usuarios (username, "passwordHash", rol, "empleadoId", activo, "creadoEn", "actualizadoEn")
SELECT
    'admin',
    '$2b$10$hGgZyolyCgB65V6lq7CJmO71w6xrM76NXm.W4pgv/A1vJ1SNr9sfi',
    'administrador',
    (SELECT id FROM empleados WHERE numero_empleado = 'ADMIN001'),
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin');

-- Días festivos de México 2026 (ejemplo)
INSERT INTO dias_festivos (fecha, descripcion, tipo, "creadoEn", "actualizadoEn")
VALUES
    ('2026-01-01', 'Año Nuevo', 'no_laborable', NOW(), NOW()),
    ('2026-02-02', 'Día de la Constitución', 'no_laborable', NOW(), NOW()),
    ('2026-03-16', 'Natalicio de Benito Juárez', 'no_laborable', NOW(), NOW()),
    ('2026-05-01', 'Día del Trabajo', 'no_laborable', NOW(), NOW()),
    ('2026-09-16', 'Día de la Independencia', 'no_laborable', NOW(), NOW()),
    ('2026-11-16', 'Día de la Revolución', 'no_laborable', NOW(), NOW()),
    ('2026-12-25', 'Navidad', 'no_laborable', NOW(), NOW())
ON CONFLICT DO NOTHING;

COMMENT ON TABLE empleados IS 'Registro de empleados de la organización';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema con roles de acceso';
COMMENT ON TABLE asistencias IS 'Registro de asistencias diarias';
COMMENT ON TABLE horarios IS 'Horarios laborales variables por empleado y día';
COMMENT ON TABLE tarjetas_nfc IS 'Asignación de tarjetas NFC a empleados';
COMMENT ON TABLE vacaciones IS 'Periodos de vacaciones de empleados';
COMMENT ON TABLE permisos IS 'Permisos laborales autorizados';
COMMENT ON TABLE dias_festivos IS 'Catálogo de días festivos';
COMMENT ON TABLE bitacora IS 'Auditoría de cambios en el sistema';
