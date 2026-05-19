import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('backups')
export class Backup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombreArchivo: string;

  @Column({ length: 255 })
  ruta: string;

  @Column({ type: 'bigint' })
  tamano: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column()
  usuarioId: number;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @CreateDateColumn()
  fechaCreacion: Date;
}
