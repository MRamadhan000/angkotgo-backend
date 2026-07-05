import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { LiveSession } from './live-session.entity';

@Entity('live_locations')
export class LiveLocation {
  // Menggunakan BIGINT di DB, TypeORM biasanya membacanya sebagai string di JS untuk menghindari overflow integer
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string; 

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude!: number;

  @Column({ type: 'int', name: 'speed_kmh', default: 0 })
  speedKmh!: number;

  @Column({ type: 'int', name: 'heading_degrees', default: 0 })
  headingDegrees!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => LiveSession, (session) => session.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: LiveSession;
}