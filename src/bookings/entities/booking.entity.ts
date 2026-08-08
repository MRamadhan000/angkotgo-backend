import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from 'src/user/entities/user.entitiy';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import { BookingStatus } from '../enum/booking.enum';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'booking_code', unique: true })
  bookingCode!: string; // Kode unik / QR Code untuk discan

  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // --- RELASI KE VEHICLE ASSIGNMENT ---
  @Column({ type: 'int', name: 'vehicle_assignment_id' })
  vehicleAssignmentId!: number;

  @ManyToOne(() => VehicleAssignment, (assignment) => assignment.bookings, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vehicle_assignment_id' })
  vehicleAssignment!: VehicleAssignment;

  @Column({ type: 'int', name: 'passenger_count', default: 1 })
  passengerCount!: number; // Jumlah tiket/orang yang dipesan

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount!: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod?: string;

  @Column({ type: 'timestamp', name: 'valid_until', nullable: true })
  validUntil?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  generateBookingCode() {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.bookingCode = `ANGKOT-${Date.now().toString().slice(-6)}-${randomStr}`;
  }
}
