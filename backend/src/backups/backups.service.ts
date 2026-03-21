import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

  async createBackup(usuarioId: number, comentario?: string): Promise<Backup> {
    const dbName = this.configService.get('DB_DATABASE');
    const dbUser = this.configService.get('DB_USERNAME');
    const dbPass = this.configService.get('DB_PASSWORD');
    const dbHost = this.configService.get('DB_HOST');
    
    // Windows path for pg_dump (assuming standard PostgreSQL 18 install)
    const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    try {
      // Create command - Passing password via env option to avoid shell quoting issues
      const command = `"${pgDumpPath}" -U ${dbUser} -h ${dbHost} ${dbName} > "${filepath}"`;
      
      try {
        await execPromise(command, {
          env: { ...process.env, PGPASSWORD: dbPass },
        });
      } catch (execError) {
        console.error('Command Execution Error:', execError);
        throw new Error(`pg_dump failed: ${execError.message}`);
      }

      if (!fs.existsSync(filepath) || fs.statSync(filepath).size === 0) {
        throw new Error('El archivo de respaldo no se generó o está vacío');
      }

      const stats = fs.statSync(filepath);

      const backup = this.backupRepository.create({
        nombreArchivo: filename,
        ruta: filepath,
        tamano: stats.size,
        usuarioId,
        comentario,
      });

      return await this.backupRepository.save(backup);
    } catch (error) {
      console.error('Error detallado generando respaldo:', error);
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
    
    if (!fs.existsSync(backup.ruta)) {
      throw new NotFoundException('El archivo físico del respaldo no existe');
    }
    
    return backup.ruta;
  }

  async remove(id: number) {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) throw new NotFoundException('Respaldo no encontrado');

    if (fs.existsSync(backup.ruta)) {
      fs.unlinkSync(backup.ruta);
    }

    return await this.backupRepository.remove(backup);
  }
}
