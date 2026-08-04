import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { DirectionType } from '../enums/route.enum';
import { RouteStop } from './route-stop.entity';


@Entity('stop_intervals')
export class StopInterval {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', name: 'route_id' })
    routeId!: number;

    @Column({
        type: 'enum',
        enum: DirectionType,
    })
    direction!: DirectionType;

    @Column({ type: 'int', name: 'from_stop_id' })
    fromStopId!: number; // ID Halte Asal (Misal: Halte 1)

    @Column({ type: 'int', name: 'to_stop_id' })
    toStopId!: number; // ID Halte Tujuan (Misal: Halte 2)

    @Column({ type: 'int', name: 'duration_in_seconds' })
    durationInSeconds!: number; // Estimasi durasi perjalanan (detik/menit)

    @Column({ type: 'decimal', precision: 5, scale: 2, name: 'distance_in_meters' })
    distanceInMeters!: number; // Jarak fisik antar halte

    // di dalam stop-interval.entity.ts
    @ManyToOne(() => RouteStop, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fromStopId' })
    fromStop!: RouteStop;

    @ManyToOne(() => RouteStop, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'toStopId' })
    toStop!: RouteStop;
}