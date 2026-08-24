import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    BeforeInsert, 
    BeforeUpdate,
    ManyToOne, 
    JoinColumn 
} from 'typeorm';
import { DirectionType } from '../enums/route.enum';
import { Route } from './route.entity';

@Entity('route_stops')
export class RouteStop {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', name: 'route_id' })
    routeId!: number;

    // Relasi ManyToOne ke Route
    @ManyToOne(() => Route, (route) => route.routeStops, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'route_id' })
    route!: Route;

    @Column({
        type: 'enum',
        enum: DirectionType,
    })
    direction!: DirectionType;

    @Column({ type: 'varchar', length: 100, name: 'stop_name' })
    stopName!: string; // Contoh: "Halte Dinoyo Permai"

    @Column({
        type: 'decimal', precision: 10, scale: 8, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    latitude!: number;

    @Column({
        type: 'decimal', precision: 11, scale: 8, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    longitude!: number;

    @Column({ type: 'int', name: 'stop_order' })
    stopOrder!: number; // Urutan halte ke-1, ke-2, dst.

    // Opsional: Kolom geom PostGIS untuk titik halte
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

    @BeforeInsert()
    @BeforeUpdate()
    generateGeom() {
        if (this.latitude !== undefined && this.longitude !== undefined) {
            this.geom = `SRID=4326;POINT(${this.longitude} ${this.latitude})` as any;
        }
    }
}