import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { VehicleAssignment } from '../../vehicles/entities/vehicle-assignment.entity';

export enum ConductorStatus {
  ACTIVE = 'ACTIVE',
  OFF_DUTY = 'OFF_DUTY',
  SUSPENDED = 'SUSPENDED',
}

@Entity('conductors')
export class Conductor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 16, unique: true })
  nik!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'photo_url' })
  photoUrl?: string;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified!: boolean;

  @Column({
    type: 'enum',
    enum: ConductorStatus,
    default: ConductorStatus.OFF_DUTY,
  })
  status!: ConductorStatus;

  @Column({ type: 'int', default: 0, name: 'total_trips' })
  totalTrips!: number;

  // Relasi balik ke penugasan kendaraan
  @OneToMany(() => VehicleAssignment, (assignment) => assignment.conductor)
  assignments!: VehicleAssignment[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}