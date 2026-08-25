import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Payment } from 'src/payments/entities/payment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', select: false }) // select: false agar password tidak ikut terambil secara tidak sengaja saat query
  password!: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: false })
  nik!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at!: Date;

  @OneToMany(
    () => Payment,
    (payment) => payment.user,
  )
  payments!: Payment[];

  // Auto-hash password sebelum disimpan ke database
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}