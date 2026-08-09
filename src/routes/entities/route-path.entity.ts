import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { DirectionType } from '../enums/route.enum';

@Entity('route_paths')
export class RoutePath {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', name: 'route_id' })
    routeId!: number;

    @Column({
        type: 'enum',
        enum: DirectionType,
    })
    direction!: DirectionType;

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

    @Column({ type: 'int', name: 'sequence_order' })
    sequenceOrder!: number;

    // Kolom geom untuk PostGIS
    // Diset select: falseopsional atau biarkan true jika ingin dibaca
    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value, // TypeORM biasanya membaca geography sebagai format WKB / GeoJSON tergantung driver
        }
    })
    geom!: string;

    // Otomatis generate geom setiap kali data di-insert atau di-update dari FE
    @BeforeInsert()
    @BeforeUpdate()
    generateGeom() {
        if (this.latitude !== undefined && this.longitude !== undefined) {
            // Format WKT (Well-Known Text) yang dikenali PostGIS secara otomatis
            this.geom = `SRID=4326;POINT(${this.longitude} ${this.latitude})` as any;
        }
    }
}