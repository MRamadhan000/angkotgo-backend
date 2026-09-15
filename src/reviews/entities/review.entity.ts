import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/user/entities/user.entitiy';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';

@Entity('reviews')
@Unique(['userId', 'vehicleAssignmentId'])
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  // ==========================================
  // USER
  // ==========================================

  @Column({
    name: 'user_id',
    type: 'int',
  })
  userId!: number;

  @ManyToOne(
    () => User,
    (user) => user.reviews,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  // ==========================================
  // VEHICLE ASSIGNMENT
  // ==========================================

  @Column({
    name: 'vehicle_assignment_id',
    type: 'int',
  })
  vehicleAssignmentId!: number;

  @ManyToOne(
    () => VehicleAssignment,
    (vehicleAssignment) => vehicleAssignment.reviews,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'vehicle_assignment_id',
  })
  vehicleAssignment!: VehicleAssignment;

  // ==========================================
  // RATING
  // ==========================================

  @Column({
    type: 'int',
  })
  rating!: number;

  // ==========================================
  // DESCRIPTION
  // ==========================================

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  // ==========================================
  // TIMESTAMPS
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