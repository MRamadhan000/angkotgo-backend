import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Route } from './route.entity';
import { DirectionType } from '../enums/route.enum';

@Entity('route_transfer_points')
@Index(['routeIdA', 'directionA', 'routeIdB', 'directionB'], { unique: true })
export class RouteTransferPoint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'route_id_a' })
  routeIdA!: number;

  @ManyToOne(() => Route, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id_a' })
  routeA!: Route;

  @Column({ type: 'enum', enum: DirectionType, name: 'direction_a' })
  directionA!: DirectionType;

  @Column({ type: 'int', name: 'sequence_a' })
  sequenceA!: number; // urutan titik di route A yang berdekatan dgn route B

  @Column({ type: 'int', name: 'route_id_b' })
  routeIdB!: number;

  @ManyToOne(() => Route, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id_b' })
  routeB!: Route;

  @Column({ type: 'enum', enum: DirectionType, name: 'direction_b' })
  directionB!: DirectionType;

  @Column({ type: 'int', name: 'sequence_b' })
  sequenceB!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  latitude!: number; // titik transfer (diambil dari titik route A)

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  longitude!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'distance_meters',
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  distanceMeters!: number; // jarak lurus antar titik terdekat route A & B

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;
}