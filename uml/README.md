# Diagramas UML - SRAP

Este directorio contiene los diagramas UML del Sistema de Registro de Asistencia de Personal en formato PlantUML.

## 📋 Diagramas Disponibles

| Archivo                   | Tipo         | Descripción                                                                     |
| ------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `clases.puml`             | Clases       | Estructura de las entidades del sistema con atributos y relaciones              |
| `casos_uso.puml`          | Casos de Uso | Funcionalidades del sistema organizadas por actor (Empleado, Supervisor, Admin) |
| `secuencia_nfc.puml`      | Secuencia    | Flujo detallado del registro de asistencia mediante tarjeta NFC                 |
| `componentes.puml`        | Componentes  | Arquitectura del sistema mostrando Frontend, Backend, DB y Arduino              |
| `actividades_faltas.puml` | Actividades  | Proceso automático de generación de faltas                                      |
| `estados_asistencia.puml` | Estados      | Ciclo de vida de un registro de asistencia                                      |
| `entidad_relacion.puml`   | ER           | Modelo de base de datos con tablas y relaciones                                 |

## 🛠️ Cómo Visualizar

### Opción 1: VS Code con Extensión PlantUML

1. Instalar extensión "PlantUML" de jebbs
2. Abrir archivo `.puml`
3. Presionar `Alt+D` para ver preview

### Opción 2: PlantUML Online

1. Ir a http://www.plantuml.com/plantuml/
2. Pegar el contenido del archivo `.puml`
3. Ver diagrama generado

### Opción 3: Generar imágenes con CLI

```bash
# Instalar PlantUML (requiere Java)
# En Windows con Chocolatey:
choco install plantuml

# Generar PNG de todos los diagramas:
plantuml *.puml

# Generar SVG:
plantuml -tsvg *.puml
```

## 📖 Descripción de Diagramas

### Diagrama de Clases (`clases.puml`)

Muestra las 9 entidades principales del sistema:

- **Empleado**: Datos personales y laborales
- **Usuario**: Credenciales de acceso con roles
- **Horario**: Horarios variables por día
- **Asistencia**: Registros de entrada/salida
- **TarjetaNfc**: Asignación de tarjetas
- **Vacacion**: Períodos de descanso
- **Permiso**: Permisos laborales
- **DiaFestivo**: Calendario de días no laborables
- **Bitacora**: Auditoría de cambios

### Diagrama de Casos de Uso (`casos_uso.puml`)

Organiza las funcionalidades por rol:

- **Empleado**: Login, consultar sus asistencias, solicitar vacaciones/permisos
- **Supervisor**: Registro manual, consultar reportes, aprobar solicitudes
- **Administrador**: Gestión completa (empleados, horarios, NFC, usuarios, bitácora)

### Diagrama de Secuencia NFC (`secuencia_nfc.puml`)

Detalla paso a paso qué ocurre cuando un empleado registra asistencia con NFC:

1. Lectura de tarjeta por Arduino
2. Validación en backend
3. Verificación de horario
4. Cálculo automático de retardo
5. Guardado en base de datos
6. Respuesta al Arduino (LED)

### Diagrama de Componentes (`componentes.puml`)

Arquitectura técnica completa:

- Frontend (Next.js + React)
- API REST con autenticación JWT
- Módulos del backend NestJS
- Servicio de comunicación serial para Arduino
- Base de datos PostgreSQL

### Diagrama de Actividades (`actividades_faltas.puml`)

Flujo del proceso nocturno de generación de faltas:

1. Verificar si es día festivo
2. Recorrer empleados activos
3. Validar vacaciones y permisos
4. Verificar horario del día
5. Generar falta o justificación

### Diagrama de Estados (`estados_asistencia.puml`)

Ciclo de vida de un registro de asistencia:

- Sin Registro → Puntual/Retardo/Falta/Justificada
- Puntual/Retardo → Completa (con salida)
- Estados finales: Completa, Justificada, Falta

### Diagrama ER (`entidad_relacion.puml`)

Modelo de base de datos detallado:

- Todas las tablas con sus columnas
- Tipos de datos
- Claves primarias y foráneas
- Restricciones UNIQUE y NOT NULL
