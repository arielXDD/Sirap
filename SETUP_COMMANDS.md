# Comandos de Instalación - SRAP

Ejecuta estos comandos en orden para completar la instalación de las dependencias:

## Backend Dependencies (en c:\Users\Ariel\Documents\srap\backend)

### Dependencias principales

```bash
npm install --save @nestjs/typeorm typeorm pg @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer serialport
```

### Dependencias de desarrollo

```bash
npm install --save-dev @types/passport-jwt @types/bcrypt @types/node
```

### Herramientas para reportes

```bash
npm install --save pdfkit exceljs winston
```

### Tipos adicionales

```bash
npm install --save-dev @types/pdfkit
```

## Frontend Dependencies (en c:\Users\Ariel\Documents\srap\frontend)

### Dependencias principales

```bash
npm install zustand react-hook-form zod @hookform/resolvers @tanstack/react-table recharts date-fns
```

### Dependencias de desarrollo

```bash
npm install --save-dev @types/node
```

---

**Una vez instaladas todas las dependencias, confirma para que yo continúe con la creación de los archivos.**
