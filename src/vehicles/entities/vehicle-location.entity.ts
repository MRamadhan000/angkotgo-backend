// src/vehicles/entities/vehicle-location.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VehicleAssignment } from './vehicle-assignment.entity';
import { RouteStop } from 'src/routes/entities/route-stop.entity'; // Sesuaikan path-nya
import { StopStatus } from '../enum/vehicle.enum';

@Entity('vehicle_locations')
export class VehicleLocation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'vehicle_assignment_id' })
    vehicleAssignmentId!: number;

    @ManyToOne(() => VehicleAssignment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_assignment_id' })
    vehicleAssignment!: VehicleAssignment;

    @Column('decimal', { 
        precision: 10, 
        scale: 8,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => (value ? parseFloat(value) : null),
        }
    })
    latitude!: number;

    @Column('decimal', { 
        precision: 11, 
        scale: 8,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => (value ? parseFloat(value) : null),
        }
    })
    longitude!: number;

    @Column({ type: 'int', name: 'current_stop_id', nullable: true })
    currentStopId?: number;

    @ManyToOne(() => RouteStop, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'current_stop_id' })
    currentStop?: RouteStop;

    @Column({
        type: 'enum',
        enum: StopStatus,
        default: StopStatus.HEADING_TO,
        name: 'stop_status'
    })
    stopStatus!: StopStatus;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;
}