import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dias_festivos')
export class DiaFestivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', unique: true })
  fecha: Date;

  @Column({ length: 200 })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: ['no_laborable', 'laborable_especial'],
    default: 'no_laborable',
  })
  tipo: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
