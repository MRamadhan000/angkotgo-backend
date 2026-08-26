import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn
} from 'typeorm';
import { RoutePath } from './route-path.entity';
import { RouteStop } from './route-stop.entity';
import { StopInterval } from './stop-interval.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 10, unique: true, name: 'route_code' })
  routeCode!: string;

  @Column({ type: 'varchar', length: 100, name: 'route_name' })
  routeName!: string;

  @OneToMany(() => RoutePath, (routePath) => routePath.route, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  routePaths!: RoutePath[];

  @OneToMany(() => RouteStop, (routeStop) => routeStop.route, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  routeStops!: RouteStop[];

  @OneToMany(() => StopInterval, (stopInterval) => stopInterval.route, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  stopIntervals!: StopInterval[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;
}