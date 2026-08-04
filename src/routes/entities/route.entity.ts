import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 10, unique: true, name: 'route_code' })
  routeCode!: string; // Contoh: "AL"

  @Column({ type: 'varchar', length: 100, name: 'route_name' })
  routeName!: string; // Contoh: "Arjosari - Landungsari"

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}