import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleAssignment } from './entities/vehicle-assignment.entity';
import { VehicleService } from './entities/vehicle-service.entity';
import { VehicleServicesController } from './controllers/vehicle-services.controller';
import { VehiclesController } from './controllers/vehicle.controller';
import { VehicleServicesService } from './services/vehicle-services.service';
import { VehiclesService } from './services/vehicles.service';
import { VehicleAssignmentsController } from './controllers/vehicle-assignments.controller';
import { VehicleAssignmentsService } from './services/vehicle-assignments.service';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Conductor } from 'src/conductors/entities/conductor.entity';
import { Route } from 'src/routes/entities/route.entity';
import { VehicleLocation } from './entities/vehicle-location.entity';
import { VehicleLocationsController } from './controllers/vehicle-locations.controller';
import { VehicleLocationsService } from './services/vehicle-locations.service';
import { RouteStop } from 'src/routes/entities/route-stop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle, 
      VehicleAssignment, 
      VehicleService,
      VehicleLocation,
      Driver,
      Conductor,
      Route,
      RouteStop,
    ])
  ],
  controllers: [
    VehiclesController,
    VehicleAssignmentsController,
    VehicleLocationsController,
    VehicleServicesController,
  ],
  providers: [
    VehiclesService,
    VehicleAssignmentsService,
    VehicleLocationsService,
    VehicleServicesService,
  ],
  exports: [
    VehiclesService,
    VehicleAssignmentsService,
    VehicleLocationsService,
    VehicleServicesService,
  ],
})
export class VehiclesModule {}