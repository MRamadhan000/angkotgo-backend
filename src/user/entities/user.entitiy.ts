import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Payment } from 'src/payments/entities/payment.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  DEACTIVE = 'DEACTIVE',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', select: false })
  password!: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @OneToMany(
    () => Payment,
    (payment) => payment.user,
  )
  payments!: Payment[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}