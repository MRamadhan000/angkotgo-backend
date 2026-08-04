import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Route } from './entities/route.entity';
import { RoutePath } from './entities/route-path.entity';
import { RouteStop } from './entities/route-stop.entity';
import { StopInterval } from './entities/stop-interval.entity';

import { RoutesController } from './controllers/routes.controller';
import { RoutePathsController } from './controllers/route-paths.controller';
import { RouteStopsController } from './controllers/route-stops.controller';
import { StopIntervalsController } from './controllers/stop-intervals.controller';

import { RoutesService } from './services/routes.service';
import { RoutePathsService } from './services/route-paths.service';
import { RouteStopsService } from './services/route-stops.service';
import { StopIntervalsService } from './services/stop-intervals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Route,
      RoutePath,
      RouteStop,
      StopInterval,
    ]),
  ],
  controllers: [
    RoutesController,
    RoutePathsController,
    RouteStopsController,
    StopIntervalsController,
  ],
  providers: [
    RoutesService,
    RoutePathsService,
    RouteStopsService,
    StopIntervalsService,
  ],
})
export class RoutesModule {}