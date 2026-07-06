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

  @CreateDateColumn({
    type: 'timestamp',
    name: 'started_at',
  })
  startedAt!: Date;

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