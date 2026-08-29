import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver } from './entities/driver.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Driver])],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
