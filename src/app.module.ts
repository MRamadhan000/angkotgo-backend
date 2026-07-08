// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { RoutesModule } from './routes/routes.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TripsModule } from './trips/trips.module';
import { LiveSessionsModule } from './live-sessions/live-sessions.module';
import { PassengersModule } from './passengers/passengers.module';

@Module({
  imports: [
    // Konfigurasi TypeORM untuk MySQL langsung tanpa .env
    TypeOrmModule.forRoot({
      type: 'postgres', 
      host: 'localhost',          // Sesuai dengan nama service di docker-compose
      port: 5432,
      username: 'postgres',     // Sesuai MYSQL_USER di docker-compose
      password: '12345', // Sesuai MYSQL_PASSWORD di docker-compose
      database: 'postgres',       // Sesuai MYSQL_DATABASE di docker-compose
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,         // Auto-sync schema, cocok untuk development
    }),
    DriversModule,
    VehiclesModule,
    RoutesModule,
    SchedulesModule,
    TripsModule,
    LiveSessionsModule,
    PassengersModule,
  ],
})
export class AppModule { }