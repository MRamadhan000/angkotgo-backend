// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { LiveSessionsService } from './live-sessions.service';
// import { LiveSessionsController } from './live-sessions.controller';
// import { LiveSession } from './entities/live-session.entity';
// import { LiveLocation } from './entities/live-location.entity';
// import { Trip } from 'src/trips/entities/trip.entity';
// import { RouteStop } from 'src/routes/entities/route-stop.entity';

// @Module({
//   imports: [TypeOrmModule.forFeature([LiveSession, LiveLocation, Trip, RouteStop,])],
//   controllers: [LiveSessionsController],
//   providers: [LiveSessionsService],
// })
// export class LiveSessionsModule { }