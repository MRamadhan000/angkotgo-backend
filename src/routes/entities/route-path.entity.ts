import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { DirectionType } from '../enums/route.enum';
import { Route } from './route.entity';

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

@Entity('route_paths')
export class RoutePath {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'route_id' })
  routeId!: number;

  @ManyToOne(() => Route, (route) => route.routePaths, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'route_id' })
  route!: Route;

  @Column({
    type: 'enum',
    enum: DirectionType,
  })
  direction!: DirectionType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  latitude!: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  longitude!: number;

  @Column({ type: 'int', name: 'sequence_order' })
  sequenceOrder!: number;

  /**
   * Kolom spasial PostGIS. JANGAN di-set manual dari luar (misal saat create DTO) —
   * biarkan diisi otomatis oleh hook di bawah berdasarkan latitude/longitude,
   * supaya tidak pernah out-of-sync.
   *
   * transformer di sini murni pass-through karena value yang masuk sudah
   * berupa objek GeoJSON valid (dibentuk oleh @BeforeInsert/@BeforeUpdate).
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

  @BeforeInsert()
  @BeforeUpdate()
  setGeomFromLatLng(): void {
    if (this.latitude != null && this.longitude != null) {
      this.geom = {
        type: 'Point',
        coordinates: [Number(this.longitude), Number(this.latitude)],
      };
    }
  }
}
