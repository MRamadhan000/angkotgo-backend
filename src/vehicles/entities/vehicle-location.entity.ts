import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VehicleAssignment } from './vehicle-assignment.entity';

@Entity('vehicle_locations')
export class VehicleLocation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    vehicleAssignmentId!: number;

    @ManyToOne(() => VehicleAssignment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicleAssignmentId' })
    vehicleAssignment!: VehicleAssignment;

    @Column('decimal', { precision: 10, scale: 6 })
    latitude!: number;

    @Column('decimal', { precision: 10, scale: 6 })
    longitude!: number;

    @CreateDateColumn()
    createdAt!: Date;
}