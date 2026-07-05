import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Trip } from '../../trips/entities/trip.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date', name: 'work_date' })
  workDate!: string;

  @Column({ type: 'int' })
  shift!: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt!: Date;

  @ManyToOne(() => Driver, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'driver_id' })
  driver!: Driver;

  @ManyToOne(() => Vehicle, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: Vehicle;

  @OneToMany(() => Trip, (trip) => trip.schedule)
  trips!: Trip[];
}