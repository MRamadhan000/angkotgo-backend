import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Vehicle } from './vehicle.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Conductor } from 'src/conductors/entities/conductor.entity';
import { Route } from 'src/routes/entities/route.entity';
import {
    AssignmentStatus,
    DirectionType,
} from '../enum/vehicle.enum';
import { MockLiveLocation } from './mock-live-locations.entity';

@Entity('schedule_templates')
export class ScheduleTemplate {
    @PrimaryGeneratedColumn()
    id!: number;

    // Rute
    @Column({
        type: 'int',
        name: 'route_id',
    })
    routeId!: number;

    @ManyToOne(() => Route, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'route_id',
    })
    route!: Route;

    // Kendaraan default (opsional)
    @Column({
        type: 'int',
        name: 'vehicle_id',
        nullable: true,
    })
    vehicleId?: number;

    @ManyToOne(() => Vehicle, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({
        name: 'vehicle_id',
    })
    vehicle?: Vehicle;

    // Driver default (opsional)
    @Column({
        type: 'int',
        name: 'driver_id',
        nullable: true,
    })
    driverId?: number;

    @ManyToOne(() => Driver, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({
        name: 'driver_id',
    })
    driver?: Driver;

    // Kondektur default (opsional)
    @Column({
        type: 'int',
        name: 'conductor_id',
        nullable: true,
    })
    conductorId?: number;

    @ManyToOne(() => Conductor, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({
        name: 'conductor_id',
    })
    conductor?: Conductor;

    // Jam keberangkatan
    @Column({
        type: 'time',
        name: 'start_time',
    })
    startTime!: string;

    // Jam estimasi selesai
    @Column({
        type: 'time',
        name: 'end_time',
    })
    endTime!: string;

    // Direction
    @Column({
        type: 'enum',
        enum: DirectionType,
        default: DirectionType.FORWARD,
    })
    direction!: DirectionType;

    // Hari aktif
    // 1 = Senin, 7 = Minggu
    @Column({
        type: 'simple-array',
        nullable: true,
        name: 'active_days',
    })
    activeDays?: number[];

    // Status aktif template
    @Column({
        type: 'boolean',
        default: true,
        name: 'is_active',
    })
    isActive!: boolean;

    // Status assignment
    @Column({
        type: 'enum',
        enum: AssignmentStatus,
        default: AssignmentStatus.COMPLETED,
    })
    status!: AssignmentStatus;

    // Mock Live Location (OPSIONAL)
    @Column({
        type: 'int',
        name: 'mock_live_location_id',
        nullable: true,
    })
    mockLiveLocationId?: number;

    @ManyToOne(
        () => MockLiveLocation,
        (mockLiveLocation) => mockLiveLocation.scheduleTemplates,
        {
            onDelete: 'SET NULL',
            nullable: true,
        },
    )
    @JoinColumn({
        name: 'mock_live_location_id',
    })
    mockLiveLocation?: MockLiveLocation;

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