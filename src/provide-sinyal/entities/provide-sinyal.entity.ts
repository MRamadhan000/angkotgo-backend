import * as typeorm from 'typeorm';
import { SinyalDetailEntity } from './provide-sinyal-detail.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export enum SinyalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

@Entity('sinyal_penumpang')
export class SinyalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  // Kolom geometry PostGIS
  @Index({ spatial: true }) // Spatial Index untuk mempercepat query pencarian jarak
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geom!: GeoJSONPoint | null;

  @Column({
    type: 'enum',
    enum: SinyalStatus,
    default: SinyalStatus.ACTIVE,
  })
  status!: SinyalStatus;

  @Column({ type: 'varchar', nullable: true })
  vehicleAssignmentId!: string | null;

  @OneToMany(() => SinyalDetailEntity, (detail) => detail.sinyal, {
    cascade: true,
  })
  details!: SinyalDetailEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
