import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { SinyalEntity } from './provide-sinyal.entity';

@Entity('sinyal_detail')
export class SinyalDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_sinyal', type: 'uuid' })
  idSinyal!: string;

  @Column({ type: 'varchar' })
  vehicleAssignmentId!: string;

  @ManyToOne(() => SinyalEntity, (sinyal) => sinyal.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_sinyal' })
  sinyal!: SinyalEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
