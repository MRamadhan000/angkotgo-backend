// src/vehicles/entities/vehicle-location.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate,
    Index,
} from 'typeorm';
import { VehicleAssignment } from './vehicle-assignment.entity';
import { RouteStop } from 'src/routes/entities/route-stop.entity'; // Sesuaikan path-nya
import { StopStatus } from '../enum/vehicle.enum';

interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

@Entity('vehicle_locations')
// Index gabungan ini penting untuk query "posisi terakhir tiap kendaraan"
// (ORDER BY createdAt DESC WHERE vehicleAssignmentId = ...) yang pasti
// sering dipanggil untuk tracking real-time.
@Index(['vehicleAssignmentId', 'createdAt'])
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
        },
    })
    latitude!: number;

    @Column('decimal', {
        precision: 11,
        scale: 8,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => (value ? parseFloat(value) : null),
        },
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
        name: 'stop_status',
    })
    stopStatus!: StopStatus;

    /**
     * Kolom PostGIS untuk posisi GPS real-time angkot.
     * JANGAN di-set manual dari luar — diisi otomatis oleh hook
     * generateGeom() di bawah berdasarkan latitude/longitude,
     * supaya selalu sinkron dengan koordinat GPS terbaru.
     *
     * transformer pass-through karena value yang masuk sudah berupa
     * objek GeoJSON valid (bukan string WKT yang ditolak driver pg
     * untuk kolom tipe 'geography').
     */
    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
        transformer: {
            to: (value: GeoJSONPoint | null) => value,
            from: (value: GeoJSONPoint) => value,
        },
    })
    geom!: GeoJSONPoint | null;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt!: Date;

    // Otomatis mengisi kolom geom setiap kali latitude/longitude masuk dari driver GPS
    @BeforeInsert()
    @BeforeUpdate()
    generateGeom(): void {
        if (
            this.latitude !== undefined &&
            this.longitude !== undefined &&
            this.latitude !== null &&
            this.longitude !== null
        ) {
            this.geom = {
                type: 'Point',
                coordinates: [Number(this.longitude), Number(this.latitude)],
            };
        }
    }
}