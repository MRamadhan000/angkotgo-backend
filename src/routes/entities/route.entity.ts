import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany 
} from 'typeorm';
import { RoutePath } from './route-path.entity';
import { RouteStop } from './route-stop.entity';
import { StopInterval } from './stop-interval.entity'; // <-- 1. Import StopInterval

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

  // <-- 2. Tambahkan relasi OneToMany ke StopInterval
  @OneToMany(() => StopInterval, (stopInterval) => stopInterval.route, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  stopIntervals!: StopInterval[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}