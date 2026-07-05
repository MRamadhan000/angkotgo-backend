import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Schedule } from '../../schedules/entities/schedule.entity';
import { Route } from '../../routes/entities/route.entity';

export enum TripStatus {
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Entity('trips')
export class Trip {
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * Urutan perjalanan dalam satu schedule.
     * Contoh:
     * 1 = AL GO
     * 2 = AL RETURN
     * 3 = AL GO
     * 4 = AL RETURN
     */
    @Column({
        type: 'int',
        name: 'trip_number',
    })
    tripNumber!: number;

    /**
     * Rute yang dijalankan pada trip ini.
     */
    @ManyToOne(() => Route, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'route_id' })
    route!: Route;

    /**
     * Jadwal kerja driver & kendaraan.
     */
    @ManyToOne(() => Schedule, (schedule) => schedule.trips, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'schedule_id' })
    schedule!: Schedule;

    /**
     * Jam keberangkatan yang direncanakan.
     */
    @Column({
        type: 'time',
        name: 'planned_departure',
    })
    plannedDeparture!: string;

    /**
     * Waktu keberangkatan sebenarnya.
     */
    @Column({
        type: 'timestamp',
        nullable: true,
        default: null,
        name: 'actual_departure',
    })
    actualDeparture?: Date;

    /**
     * Jam tiba yang direncanakan.
     */
    @Column({
        type: 'time',
        name: 'planned_arrival',
    })
    plannedArrival!: string;

    /**
     * Waktu tiba sebenarnya.
     */
    @Column({
        type: 'timestamp',
        nullable: true,
        default: null,
        name: 'actual_arrival',
    })
    actualArrival?: Date;

    /**
     * Status perjalanan.
     */
    @Column({
        type: 'enum',
        enum: TripStatus,
        default: TripStatus.SCHEDULED,
    })
    status!: TripStatus;

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
}