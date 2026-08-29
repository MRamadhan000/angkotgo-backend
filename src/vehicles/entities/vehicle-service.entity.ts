import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { ServiceType } from '../enum/vehicle.enum';

@Entity('vehicle_services')
export class VehicleService {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'vehicle_id' })
  vehicleId!: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: Vehicle;

  @Column({
    type: 'enum',
    enum: ServiceType,
    default: ServiceType.ROUTINE,
    name: 'service_type',
  })
  serviceType!: ServiceType;

  @Column({ type: 'text' })
  description!: string; // Detail pekerjaan servis (ganti oli, ganti kampas rem, dll)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cost!: number; // Biaya perbaikan

  @Column({ type: 'int', name: 'odometer_at_service' })
  odometerAtService!: number; // Posisi KM mobil saat diservis

  @Column({ type: 'date', name: 'service_date' })
  serviceDate!: Date; // Tanggal servis dilakukan

  @Column({ type: 'date', nullable: true, name: 'next_service_date' })
  nextServiceDate?: Date; // Estimasi tanggal servis berikutnya

  @Column({ type: 'int', nullable: true, name: 'next_service_odometer' })
  nextServiceOdometer?: number; // Target KM untuk servis berikutnya

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}