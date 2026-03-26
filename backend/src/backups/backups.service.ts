import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup } from './backup.entity';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);

@Injectable()
export class BackupsService {
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    @InjectRepository(Backup)
    private readonly backupRepository: Repository<Backup>,
    private readonly configService: ConfigService,
  ) {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private getPgBinPath(): string {
    // Intenta encontrar pg_dump/psql en rutas comunes de Windows
    const candidates = [
      'C:\\Program Files\\PostgreSQL\\18\\bin',
      'C:\\Program Files\\PostgreSQL\\17\\bin',
      'C:\\Program Files\\PostgreSQL\\16\\bin',
      'C:\\Program Files\\PostgreSQL\\15\\bin',
    ];
    for (const dir of candidates) {
      if (fs.existsSync(path.join(dir, 'pg_dump.exe'))) return dir;
    }
    return 'C:\\Program Files\\PostgreSQL\\18\\bin'; // fallback
  }

  async createBackup(usuarioId: number, comentario?: string): Promise<Backup> {
    const dbName = this.configService.get('DB_DATABASE');
    const dbUser = this.configService.get('DB_USERNAME');
    const dbPass = this.configService.get('DB_PASSWORD');
    const dbHost = this.configService.get('DB_HOST');
    const pgBin = this.getPgBinPath();
    const pgDumpPath = path.join(pgBin, 'pg_dump.exe');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    try {
      const command = `"${pgDumpPath}" -U ${dbUser} -h ${dbHost} ${dbName} > "${filepath}"`;
      await execPromise(command, { env: { ...process.env, PGPASSWORD: dbPass } });

      if (!fs.existsSync(filepath) || fs.statSync(filepath).size === 0) {
        throw new Error('El archivo de respaldo no se generó o está vacío');
      }

      const stats = fs.statSync(filepath);
      const backup = this.backupRepository.create({ nombreArchivo: filename, ruta: filepath, tamano: stats.size, usuarioId, comentario });
      return await this.backupRepository.save(backup);
    } catch (error) {
      throw new InternalServerErrorException(`Error al generar respaldo: ${error.message}`);
    }
  }

  async findAll() {
    return await this.backupRepository.find({
      relations: ['usuario', 'usuario.empleado'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async getDownloadPath(id: number): Promise<string> {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) throw new NotFoundException('Respaldo no encontrado');
    if (!fs.existsSync(backup.ruta)) throw new NotFoundException('El archivo físico del respaldo no existe');
    return backup.ruta;
  }

  async restoreFromFile(filePath: string): Promise<{ message: string }> {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('El archivo de respaldo no existe');
    }

    const dbName = this.configService.get('DB_DATABASE');
    const dbUser = this.configService.get('DB_USERNAME');
    const dbPass = this.configService.get('DB_PASSWORD');
    const dbHost = this.configService.get('DB_HOST');
    const pgBin = this.getPgBinPath();
    const psqlPath = path.join(pgBin, 'psql.exe');

    try {
      // 1. Ejecutar el SQL directamente sobre la base de datos existente
      const command = `"${psqlPath}" -U ${dbUser} -h ${dbHost} -d ${dbName} -f "${filePath}"`;
      await execPromise(command, { env: { ...process.env, PGPASSWORD: dbPass } });

      // 2. Resetear las secuencias de autoincremento para evitar conflictos de PK
      //    tras restaurar un backup (las secuencias pueden quedar desfasadas)
      await this.backupRepository.manager.query(`
        DO $$
        DECLARE
          r RECORD;
          seq_name TEXT;
          max_id BIGINT;
        BEGIN
          FOR r IN
            SELECT
              tc.table_name,
              kc.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kc
              ON tc.constraint_name = kc.constraint_name
              AND tc.table_schema = kc.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema = 'public'
          LOOP
            BEGIN
              seq_name := pg_get_serial_sequence(r.table_name, r.column_name);
              IF seq_name IS NOT NULL THEN
                EXECUTE 'SELECT COALESCE(MAX(' || r.column_name || '), 0) FROM ' || r.table_name
                  INTO max_id;
                PERFORM setval(seq_name, GREATEST(max_id, 1));
              END IF;
            EXCEPTION WHEN OTHERS THEN
              NULL; -- ignorar tablas sin secuencia
            END;
          END LOOP;
        END $$;
      `);

      return { message: 'Base de datos restaurada correctamente. Las secuencias fueron reiniciadas.' };
    } catch (error) {
      throw new InternalServerErrorException(`Error al restaurar: ${error.message}`);
    }
  }

  async restoreFromUpload(fileBuffer: Buffer, originalName: string): Promise<{ message: string }> {
    // Guardar temporalmente el archivo subido
    const tmpPath = path.join(this.backupDir, `restore_tmp_${Date.now()}.sql`);
    fs.writeFileSync(tmpPath, fileBuffer);
    try {
      const result = await this.restoreFromFile(tmpPath);
      return result;
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
  }

  async remove(id: number) {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) throw new NotFoundException('Respaldo no encontrado');
    if (fs.existsSync(backup.ruta)) fs.unlinkSync(backup.ruta);
    return await this.backupRepository.remove(backup);
  }
}
