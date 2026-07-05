import { Module } from '@nestjs/common';
import { RoutesService } from './services/routes.service';
import { RoutesController } from './controllers/routes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutePoint } from './entities/route-point.entity';
import { RouteStop } from './entities/route-stop.entity';
import { Route } from './entities/route.entity';
import { RoutePointsController } from './controllers/route-points.controller';
import { RoutePointsService } from './services/route-points.service';
import { RouteStopsController } from './controllers/route-stops.controller';
import { RouteStopsService } from './services/route-stops.service';

@Module({
  imports: [TypeOrmModule.forFeature([Route, RoutePoint, RouteStop])],
  controllers: [RoutesController, RoutePointsController, RouteStopsController],// <-- Tambahkan di sini],
  providers: [RoutesService, RoutePointsService, RouteStopsService],
})
export class RoutesModule { }