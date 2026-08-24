import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { DirectionType } from '../enums/route.enum';
import { RouteStop } from './route-stop.entity';
import { Route } from './route.entity'; // <-- 1. Import Route

@Entity('stop_intervals')
export class StopInterval {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', name: 'route_id' })
    routeId!: number;

    // <-- 2. Hubungkan StopInterval ke Route
    @ManyToOne(() => Route, (route) => route.stopIntervals, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'route_id' })
    route!: Route;

    @Column({
        type: 'enum',
        enum: DirectionType,
    })
    direction!: DirectionType;

    @Column({ type: 'int', name: 'from_stop_id' })
    fromStopId!: number; // ID Halte Asal

    @Column({ type: 'int', name: 'to_stop_id' })
    toStopId!: number; // ID Halte Tujuan

    @Column({ type: 'int', name: 'duration_in_seconds' })
    durationInSeconds!: number; // Estimasi durasi perjalanan

    @Column({ type: 'decimal', precision: 8, scale: 2, name: 'distance_in_meters' })
    distanceInMeters!: number; // Jarak fisik antar halte

    // <-- 3. Perbaiki name di JoinColumn sesuai nama kolom DB (from_stop_id & to_stop_id)
    @ManyToOne(() => RouteStop, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'from_stop_id' })
    fromStop!: RouteStop;

    @ManyToOne(() => RouteStop, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'to_stop_id' })
    toStop!: RouteStop;
}