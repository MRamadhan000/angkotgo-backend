import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { SinyalEntity } from './provide-sinyal.entity';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';

@Entity('sinyal_detail')
export class SinyalDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_sinyal', type: 'uuid' })
  idSinyal!: string;

  @Column({ name: 'vehicle_assignment_id', type: 'varchar' })
  vehicleAssignmentId!: string;

  @ManyToOne(() => SinyalEntity, (sinyal) => sinyal.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_sinyal' })
  sinyal!: SinyalEntity;

  @ManyToOne(() => VehicleAssignment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicle_assignment_id' })
  vehicleAssignment!: VehicleAssignment;

  @CreateDateColumn()
  createdAt!: Date;
}