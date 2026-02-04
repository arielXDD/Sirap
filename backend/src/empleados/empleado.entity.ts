import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Horario } from '../horarios/horario.entity';
import { Asistencia } from '../asistencias/asistencia.entity';
import { Vacacion } from '../vacaciones/vacacion.entity';
import { Permiso } from '../permisos/permiso.entity';
import { TarjetaNfc } from '../tarjetas-nfc/tarjeta-nfc.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numeroEmpleado: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellidos: string;

  @Column({ length: 100 })
  puesto: string;

  @Column({ length: 100 })
  area: string;

  @Column({ type: 'date' })
  fechaIngreso: Date;

  @Column({
    type: 'enum',
    enum: ['activo', 'inactivo', 'suspendido'],
    default: 'activo',
  })
  estatus: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  // Relaciones
  @OneToMany(() => Horario, (horario) => horario.empleado)
  horarios: Horario[];

  @OneToMany(() => Asistencia, (asistencia) => asistencia.empleado)
  asistencias: Asistencia[];

  @OneToMany(() => Vacacion, (vacacion) => vacacion.empleado)
  vacaciones: Vacacion[];

  @OneToMany(() => Permiso, (permiso) => permiso.empleado)
  permisos: Permiso[];

  @OneToOne(() => TarjetaNfc, (tarjeta) => tarjeta.empleado)
  tarjetaNfc: TarjetaNfc;

  @OneToOne(() => Usuario, (usuario) => usuario.empleado)
  usuario: Usuario;
}
