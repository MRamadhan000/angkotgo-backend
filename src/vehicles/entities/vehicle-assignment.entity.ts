import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { AssignmentStatus, DirectionType } from '../enum/vehicle.enum';
import { Route } from 'src/routes/entities/route.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Conductor } from 'src/conductors/entities/conductor.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Entity('vehicle_assignments')
export class VehicleAssignment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', name: 'vehicle_id' })
    vehicleId!: number;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.assignments, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle!: Vehicle;

    @Column({ type: 'int', name: 'driver_id' })
    driverId!: number;

    @ManyToOne(() => Driver, (driver) => driver.assignments, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'driver_id' })
    driver!: Driver;

    @Column({ type: 'int', name: 'route_id' })
    routeId!: number;

    @ManyToOne(() => Route, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'route_id' })
    route!: Route;

    // Pembeda arah perjalanan (Berangkat / Pulang)
    @Column({
        type: 'enum',
        enum: DirectionType,
        default: DirectionType.FORWARD,
    })
    direction!: DirectionType;

    @Column({ type: 'int', default: 0, name: 'current_passengers' })
    currentPassengers!: number;

    @Column({ type: 'date', name: 'assignment_date' })
    assignmentDate!: Date; // Tanggal penugasan (YYYY-MM-DD)

    @Column({ type: 'time', name: 'start_time' })
    startTime!: string; // Jam mulai (HH:MM:SS)

    @Column({ type: 'time', name: 'end_time' })
    endTime!: string; // Jam selesai (HH:MM:SS)

    @Column({
        type: 'enum',
        enum: AssignmentStatus,
        default: AssignmentStatus.SCHEDULED,
    })
    status!: AssignmentStatus;

    @Column({ type: 'int', name: 'conductor_id', nullable: true })
    conductorId?: number;

    @ManyToOne(() => Conductor, (conductor) => conductor.assignments, { onDelete: 'RESTRICT', nullable: true })
    @JoinColumn({ name: 'conductor_id' })
    conductor?: Conductor;

    @OneToMany(
        () => Payment,
        (payment) => payment.vehicleAssignment,
    )
    payments!: Payment[];

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt!: Date;
}