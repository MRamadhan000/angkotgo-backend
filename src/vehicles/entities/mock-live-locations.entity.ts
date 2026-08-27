import { Route } from 'src/routes/entities/route.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { DirectionType } from '../enum/vehicle.enum';
import { ScheduleTemplate } from './schedule-template.entity';

@Entity('mock_live_locations')
export class MockLiveLocation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'int', name: 'route_id' })
    routeId!: number;

    @ManyToOne(() => Route, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'route_id' })
    route!: Route;

    @Column({
        type: 'enum',
        enum: DirectionType,
    })
    direction!: DirectionType;

    @Column({
        type: 'jsonb',
    })
    // lng lat
    coordinates!: [number, number][];

    @CreateDateColumn({
        type: 'timestamp',
        name: 'recorded_at',
    })
    recordedAt!: Date;

    @OneToMany(
        () => ScheduleTemplate,
        (scheduleTemplate) => scheduleTemplate.mockLiveLocation,
    )
    scheduleTemplates!: ScheduleTemplate[];
}