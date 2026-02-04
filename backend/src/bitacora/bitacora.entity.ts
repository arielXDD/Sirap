import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('bitacora')
export class Bitacora {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.bitacoras, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column({ nullable: true })
  usuarioId: number;

  @Column({ length: 100 })
  accion: string;

  @Column({ length: 100 })
  tablaAfectada: string;

  @Column({ type: 'int', nullable: true })
  registroId: number;

  @Column({ type: 'json', nullable: true })
  datosAnteriores: any;

  @Column({ type: 'json', nullable: true })
  datosNuevos: any;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  fechaHora: Date;
}
