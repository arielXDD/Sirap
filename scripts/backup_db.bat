@echo off
SET DB_NAME=srap
SET DB_USER=postgres
SET DB_PASSWORD=postgres
SET BACKUP_PATH=C:\Users\Ariel\Documents\srap\backups
SET TIMESTAMP=%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%_%TIME:~0,2%-%TIME:~3,2%

if not exist "%BACKUP_PATH%" mkdir "%BACKUP_PATH%"

echo [*] Iniciando respaldo de base de datos %DB_NAME%...
set PGPASSWORD=%DB_PASSWORD%
"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U %DB_USER% -h localhost %DB_NAME% > "%BACKUP_PATH%\backup_%TIMESTAMP%.sql"

if %ERRORLEVEL% equ 0 (
    echo [OK] Respaldo completado exitosamente en %BACKUP_PATH%
) else (
    echo [ERROR] Hubo un problema al generar el respaldo.
)
pause
