import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { VehicleAssignment } from './vehicle-assignment.entity';
import { VehicleService } from './vehicle-service.entity';
import { VehicleStatus } from '../enum/vehicle.enum';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 15, unique: true, name: 'plate_number' })
  plateNumber!: string;

  @Column({ type: 'varchar', length: 20, unique: true, name: 'vehicle_code' })
  vehicleCode!: string;

  @Column({ type: 'int', default: 0 })
  capacity!: number;

  @Column({ type: 'int', default: 0, name: 'current_odometer' })
  currentOdometer!: number;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status!: VehicleStatus;

  @OneToMany(() => VehicleAssignment, (assignment) => assignment.vehicle)
  assignments!: VehicleAssignment[];

  @OneToMany(() => VehicleService, (service) => service.vehicle)
  services!: VehicleService[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}