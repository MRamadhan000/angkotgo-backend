import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  OFF_DUTY = 'OFF_DUTY',
  SUSPENDED = 'SUSPENDED',
}

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 16, unique: true })
  nik!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string; // <-- Kolom email baru

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'license_number' })
  licenseNumber!: string;

  @Column({ type: 'date', name: 'license_expiry_date' })
  licenseExpiryDate!: Date;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'photo_url' })
  photoUrl?: string;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified!: boolean;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.OFF_DUTY,
  })
  status!: DriverStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.00, name: 'average_rating' })
  averageRating!: number;

  @Column({ type: 'int', default: 0, name: 'total_trips' })
  totalTrips!: number;

  @Column({ type: 'json', nullable: true, name: 'bank_account_info' })
  bankAccountInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}