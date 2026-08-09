// src/vehicles/entities/vehicle-location.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
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

    // Kolom PostGIS untuk posisi GPS real-time angkot
    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value,
        }
    })
    geom!: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;

    // Otomatis mengisi kolom geom setiap kali latitude/longitude masuk dari driver GPS
    @BeforeInsert()
    @BeforeUpdate()
    generateGeom() {
        if (this.latitude !== undefined && this.longitude !== undefined && this.latitude !== null && this.longitude !== null) {
            this.geom = `SRID=4326;POINT(${this.longitude} ${this.latitude})` as any;
        }
    }
}