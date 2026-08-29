import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { LiveSession } from './live-session.entity';

@Entity('live_locations')
// Index ini krusial: query "posisi terakhir per session" akan sering
// dijalankan (DISTINCT ON session_id ORDER BY created_at DESC).
@Index(['sessionId', 'createdAt'])
export class LiveLocation {
  // Menggunakan BIGINT di DB, TypeORM biasanya membacanya sebagai string di JS untuk menghindari overflow integer
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'session_id' })
  sessionId!: number;

  @ManyToOne(() => LiveSession, (session) => session.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: LiveSession;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value != null ? parseFloat(value) : null),
    },
  })
  latitude!: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value != null ? parseFloat(value) : null),
    },
  })
  longitude!: number;

  @Column({ type: 'int', name: 'speed_kmh', default: 0 })
  speedKmh!: number;

  @Column({ type: 'int', name: 'heading_degrees', default: 0 })
  headingDegrees!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;
}