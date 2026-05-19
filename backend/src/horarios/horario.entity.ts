import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empleado } from '../empleados/empleado.entity';

@Entity('horarios')
export class Horario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Empleado, (empleado) => empleado.horarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'empleadoId' })
  empleado: Empleado;

  @Column()
  empleadoId: number;

  @Column({
    type: 'enum',
    enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
  })
  diaSemana: string;

  @Column({ type: 'time' })
  horaEntrada: string;

  @Column({ type: 'time' })
  horaSalida: string;

  @Column({ type: 'int', default: 10, comment: 'Tolerancia en minutos para retardos' })
  toleranciaMinutos: number;

  @Column({ type: 'date', nullable: true, comment: 'Inicio de horario temporal' })
  fechaInicio: Date;

  @Column({ type: 'date', nullable: true, comment: 'Fin de horario temporal' })
  fechaFin: Date;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
