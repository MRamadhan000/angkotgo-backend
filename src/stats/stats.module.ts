import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './stats.controller';
import { StatisticsService } from './stats.service';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Route } from '../routes/entities/route.entity';
import { RouteStop } from '../routes/entities/route-stop.entity';
import { ScheduleTemplate } from '../vehicles/entities/schedule-template.entity';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import { Cost } from 'src/tarif/entities/cost.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Driver,
      Vehicle,
      Route,
      RouteStop,
      ScheduleTemplate,
      VehicleAssignment,
      Cost,
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
