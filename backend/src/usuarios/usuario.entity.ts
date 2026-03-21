import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empleado } from '../empleados/empleado.entity';
import { Bitacora } from '../bitacora/bitacora.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: ['administrador', 'supervisor', 'empleado'],
    default: 'empleado',
  })
  rol: string;

  @OneToOne(() => Empleado, (empleado) => empleado.usuario, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'empleadoId' })
  empleado: Empleado;

  @Column({ unique: true })
  empleadoId: number;

  @Column({ default: true })
  activo: boolean;

  // ── Bloqueo de cuenta y Seguridad ──────────────────────────
  @Column({ default: 0 })
  intentosFallidos: number;

  @Column({ default: false })
  bloqueado: boolean;

  @Column({ nullable: true, select: false })
  codigoDesbloqueo: string;

  @Column({ nullable: true, type: 'timestamp' })
  codigoDesbloqueoExpiracion: Date;
  // ────────────────────────────────────────────────────────────

  // ── Recuperación de contraseña ──────────────────────────────
  @Column({ nullable: true, select: false })
  resetToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpiry: Date;
  // ────────────────────────────────────────────────────────────

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @OneToMany(() => Bitacora, (bitacora) => bitacora.usuario)
  bitacoras: Bitacora[];
}
