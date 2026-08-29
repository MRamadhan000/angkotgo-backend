// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

// import { PassengerService } from './passengers.service';
// import { PassengerController } from './passengers.controller'; // kalau ada

// import { RouteStop } from 'src/routes/entities/route-stop.entity';
// import { Route } from 'src/routes/entities/route.entity';
// import { Trip } from 'src/trips/entities/trip.entity';
// import { LiveSession } from 'src/live-sessions/entities/live-session.entity';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([
//       RouteStop,
//       Route,
//       Trip,
//       LiveSession,
//     ]),
//   ],
//   providers: [PassengerService],
//   controllers: [PassengerController], // hapus kalau belum ada controller
//   exports: [PassengerService],        // penting kalau mau dipakai module lain
// })
// export class PassengersModule { }