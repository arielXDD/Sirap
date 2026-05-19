import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empleado } from '../empleados/empleado.entity';

@Entity('tarjetas_nfc')
export class TarjetaNfc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100, comment: 'Código UID de la tarjeta NFC' })
  codigoNfc: string;

  @OneToOne(() => Empleado, (empleado) => empleado.tarjetaNfc, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'empleadoId' })
  empleado: Empleado;

  @Column({ unique: true })
  empleadoId: number;

  @Column({ type: 'date' })
  fechaAsignacion: Date;

  @Column({ default: true })
  activa: boolean;

  @Column({ type: 'text', nullable: true })
  motivoBaja: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
