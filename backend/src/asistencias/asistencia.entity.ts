import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Empleado } from '../empleados/empleado.entity';

@Entity('asistencias')
// Índices compuestos para las consultas más frecuentes
@Index('IDX_asistencias_fecha', ['fecha'])
@Index('IDX_asistencias_empleado_fecha', ['empleadoId', 'fecha'])
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Empleado, (empleado) => empleado.asistencias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'empleadoId' })
  empleado: Empleado;

  @Column()
  empleadoId: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time', nullable: true })
  horaEntrada: string;

  @Column({ type: 'time', nullable: true })
  horaSalida: string;

  @Column({
    type: 'enum',
    enum: ['normal', 'manual'],
    default: 'normal',
    comment: 'Normal = NFC, Manual = registrado por admin',
  })
  tipoRegistro: string;

  @Column({
    type: 'enum',
    enum: ['puntual', 'retardo', 'falta', 'justificada'],
    default: 'puntual',
  })
  estado: string;

  @Column({ type: 'int', nullable: true, comment: 'Minutos de retardo' })
  minutosRetardo: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
