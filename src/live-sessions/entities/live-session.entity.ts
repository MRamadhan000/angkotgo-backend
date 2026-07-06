import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { LiveLocation } from './live-location.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { RouteStop } from '../../routes/entities/route-stop.entity';

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Entity('live_sessions')
export class LiveSession {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Trip yang sedang dijalankan.
   */
  @ManyToOne(() => Trip, (trip) => trip.liveSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status!: SessionStatus;

  /**
   * Halte terakhir yang telah dilewati.
   */
  @ManyToOne(() => RouteStop, {
    nullable: true,
  })
  @JoinColumn({ name: 'current_stop_id' })
  currentStop?: RouteStop;

  /**
   * Urutan halte terakhir yang telah dilewati.
   */
  @Column({
    type: 'int',
    name: 'current_sequence',
    nullable: true,
  })
  currentSequence?: number;

  /**
   * Halte berikutnya yang sedang dituju.
   */
  @ManyToOne(() => RouteStop, {
    nullable: true,
  })
  @JoinColumn({ name: 'next_stop_id' })
  nextStop?: RouteStop;

  /**
   * Urutan halte berikutnya.
   */
  @Column({
    type: 'int',
    name: 'next_sequence',
    nullable: true,
  })
  nextSequence?: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'started_at',
  })
  startedAt!: Date;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_at_stop',
  })
  isAtStop!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
    name: 'ended_at',
  })
  endedAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt!: Date;

  @OneToMany(() => LiveLocation, (location) => location.session, {
    cascade: true,
  })
  locations!: LiveLocation[];
}