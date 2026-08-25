import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import { User } from 'src/user/entities/user.entitiy';

export enum PaymentType {
  CASH = 'CASH',
  ONLINE = 'ONLINE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Kode pembayaran internal
   * Contoh: PAY-20260825-X92PL
   */
  @Column({
    name: 'payment_code',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  paymentCode!: string;

  /**
   * Vehicle Assignment
   */
  @Column({
    name: 'vehicle_assignment_id',
    type: 'int',
  })
  vehicleAssignmentId!: number;

  @ManyToOne(
    () => VehicleAssignment,
    (vehicleAssignment) => vehicleAssignment.payments,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'vehicle_assignment_id',
  })
  vehicleAssignment!: VehicleAssignment;

  /**
   * User yang melakukan pembayaran
   */
  @Column({
    name: 'user_id',
    type: 'int',
  })
  userId!: number;

  @ManyToOne(
    () => User,
    (user) => user.payments,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  /**
   * Jenis pembayaran
   */
  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: PaymentType,
  })
  paymentType!: PaymentType;

  /**
   * Nominal pembayaran
   */
  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  amount!: number;

  /**
   * Status pembayaran
   */
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  // ==========================================
  // MIDTRANS
  // ==========================================

  @Column({
    name: 'midtrans_order_id',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  midtransOrderId!: string | null;

  @Column({
    name: 'midtrans_transaction_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  midtransTransactionId!: string | null;

  @Column({
    name: 'midtrans_payment_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  midtransPaymentType!: string | null;

  @Column({
    name: 'midtrans_transaction_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  midtransTransactionStatus!: string | null;

  @Column({
    name: 'midtrans_transaction_time',
    type: 'timestamp',
    nullable: true,
  })
  midtransTransactionTime!: Date | null;

  @Column({
    name: 'midtrans_settlement_time',
    type: 'timestamp',
    nullable: true,
  })
  midtransSettlementTime!: Date | null;

  // ==========================================
  // PAYMENT TIME
  // ==========================================

  @Column({
    name: 'paid_at',
    type: 'timestamp',
    nullable: true,
  })
  paidAt!: Date | null;

  // ==========================================
  // TIMESTAMP
  // ==========================================

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt!: Date;
}