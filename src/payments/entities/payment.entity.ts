import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
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
   * Contoh:
   * PAY-20260907-X92PL
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
   * Status pembayaran internal
   */
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  // ==========================================
  // XENDIT
  // ==========================================

  /**
   * Xendit Payment Request ID
   *
   * Contoh:
   * pr-11dc8c00-xxxx-xxxx
   */
  @Column({
    name: 'xendit_payment_request_id',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  xenditPaymentRequestId!: string | null;

  /**
   * Reference ID yang dikirim ke Xendit
   *
   * Biasanya menggunakan paymentCode internal.
   */
  @Column({
    name: 'xendit_reference_id',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  xenditReferenceId!: string | null;

  /**
   * Status payment dari Xendit
   *
   * Contoh:
   * PENDING
   * SUCCEEDED
   * FAILED
   */
  @Column({
    name: 'xendit_payment_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  xenditPaymentStatus!: string | null;

  /**
   * Channel pembayaran
   *
   * Contoh:
   * QRIS
   */
  @Column({
    name: 'xendit_channel_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  xenditChannelCode!: string | null;

  /**
   * Xendit payment method ID
   */
  @Column({
    name: 'xendit_payment_method_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  xenditPaymentMethodId!: string | null;

  /**
   * URL / data QRIS dari Xendit
   *
   * Bisa digunakan FE untuk menampilkan QR.
   */
  @Column({
    name: 'xendit_qr_string',
    type: 'text',
    nullable: true,
  })
  xenditQrString!: string | null;

  /**
   * Waktu pembayaran dari Xendit
   */
  @Column({
    name: 'xendit_paid_at',
    type: 'timestamp',
    nullable: true,
  })
  xenditPaidAt!: Date | null;

  /**
   * Response / error code dari Xendit
   *
   * Contoh:
   * API_VALIDATION_ERROR
   */
  @Column({
    name: 'xendit_error_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  xenditErrorCode!: string | null;

  /**
   * Pesan error dari Xendit
   */
  @Column({
    name: 'xendit_error_message',
    type: 'text',
    nullable: true,
  })
  xenditErrorMessage!: string | null;

  // ==========================================
  // PAYMENT TIME
  // ==========================================

  /**
   * Waktu pembayaran berhasil
   */
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

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt!: Date | null;
}