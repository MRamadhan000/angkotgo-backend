import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, 
        ssl: {
          rejectUnauthorized: false,
        },
      }),
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