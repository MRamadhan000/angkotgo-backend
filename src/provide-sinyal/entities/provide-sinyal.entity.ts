import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SinyalDetailEntity } from './provide-sinyal-detail.entity';
import { User } from 'src/user/entities/user.entitiy';
import { Route } from 'src/routes/entities/route.entity';

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export enum SinyalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum DirectionType {
  FORWARD = 'FORWARD', // Arah Pergi
  RETURN = 'RETURN',   // Arah Pulang
}

@Entity('sinyal_penumpang')
export class SinyalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  userId!: number;

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

  // ─── Field Target / Destinasi ───
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  targetLat!: number | null;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  targetLng!: number | null;

  // ─── Field Nama Lokasi Asal & Tujuan ───
  @Column({ type: 'varchar', nullable: true })
  sourceName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  destName!: string | null;

  // ─── Relasi Route & Direction ───
  @Column({ type: 'int', nullable: true })
  routeId!: number | null;

  @ManyToOne(() => Route, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'routeId' })
  route!: Route | null;

  @Column({
    type: 'enum',
    enum: DirectionType,
    nullable: true,
  })
  direction!: DirectionType | null;

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

  // ─── Relasi User ───
  @ManyToOne(() => User, (user) => user.sinyal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // ─── Relasi Sinyal Details ───
  @OneToMany(() => SinyalDetailEntity, (detail) => detail.sinyal, {
    cascade: true,
  })
  details!: SinyalDetailEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}