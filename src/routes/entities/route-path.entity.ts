import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
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
            from: (value: string) => parseFloat(value), // Mengonversi string decimal dari DB kembali jadi number di TS
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
    sequenceOrder!: number; // Urutan titik koordinat agar garis jalurnya tidak acak-acakan
}