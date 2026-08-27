import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity'; // Sesuaikan path-nya
import { Driver } from 'src/drivers/entities/driver.entity';
import { Conductor } from 'src/conductors/entities/conductor.entity';
import { Route } from 'src/routes/entities/route.entity';
import { DirectionType } from '../enum/vehicle.enum';
import { MockLiveLocation } from './mock-live-locations.entity';

@Entity('schedule_templates')
export class ScheduleTemplate {
    @PrimaryGeneratedColumn()
    id!: number;

    // Rute yang dilewati template ini
    @Column({ type: 'int', name: 'route_id' })
    routeId!: number;

    @ManyToOne(() => Route, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'route_id' })
    route!: Route;

    // Kendaraan default (opsional, bisa diisi nanti saat generate)
    @Column({ type: 'int', name: 'vehicle_id', nullable: true })
    vehicleId?: number;

    @ManyToOne(() => Vehicle, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle?: Vehicle;

    // Driver default (opsional)
    @Column({ type: 'int', name: 'driver_id', nullable: true })
    driverId?: number;

    @ManyToOne(() => Driver, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'driver_id' })
    driver?: Driver;

    // Kondektur default (opsional)
    @Column({ type: 'int', name: 'conductor_id', nullable: true })
    conductorId?: number;

    @ManyToOne(() => Conductor, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'conductor_id' })
    conductor?: Conductor;

    // Jam keberangkatan rutin (Contoh: '07:00:00')
    @Column({ type: 'time', name: 'start_time' })
    startTime!: string;

    // Jam estimasi selesai (Contoh: '09:30:00')
    @Column({ type: 'time', name: 'end_time' })
    endTime!: string;

    @Column({
        type: 'enum',
        enum: DirectionType,
        default: DirectionType.FORWARD,
    })
    direction!: DirectionType;

    // Hari aktif template ini dijalankan (Misal: [1, 2, 3, 4, 5, 6, 7] atau string '1,2,3,4,5' untuk Senin-Jumat)
    // 1 = Senin, 7 = Minggu (ISO Day of Week)
    @Column({ type: 'simple-array', nullable: true, name: 'active_days' })
    activeDays?: number[];

    // Status aktif tidaknya template
    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt!: Date;

    @Column({
        type: 'int',
        name: 'mock_live_location_id',
    })
    mockLiveLocationId!: number;

    @ManyToOne(
        () => MockLiveLocation,
        (mockLiveLocation) => mockLiveLocation.scheduleTemplates,
        {
            onDelete: 'RESTRICT',
        },
    )
    @JoinColumn({ name: 'mock_live_location_id' })
    mockLiveLocation!: MockLiveLocation;
}