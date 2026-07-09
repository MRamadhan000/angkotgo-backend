import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoutePoint } from './route-point.entity';
import { RouteStop } from './route-stop.entity';

export enum RouteDirection {
  GO = 'GO',
  RETURN = 'RETURN',
}

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 10 })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({
    type: 'enum',
    enum: RouteDirection,
  })
  direction!: RouteDirection;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'distance_km',
    nullable: true,
  })
  distanceKm?: number;

  @Column({ type: 'int', name: 'estimated_duration_minutes', nullable: true })
  estimatedDurationMinutes?: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => RoutePoint, (routePoint) => routePoint.route, {
    cascade: true,
  })
  points!: RoutePoint[];

  @OneToMany(() => RouteStop, (routeStop) => routeStop.route, { cascade: true })
  stops!: RouteStop[];
}
