import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToMany 
} from 'typeorm';
import { LiveLocation } from './live-location.entity';

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Entity('live_sessions')
export class LiveSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'trip_id' })
  tripId!: number;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status!: SessionStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'started_at' })
  startedAt!: Date;

  @Column({ type: 'timestamp', name: 'ended_at', nullable: true, default: null })
  endedAt?: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => LiveLocation, (location) => location.session, { cascade: true })
  locations!: LiveLocation[];
}
