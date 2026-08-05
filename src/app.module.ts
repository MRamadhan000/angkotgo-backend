import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { RoutesModule } from './routes/routes.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TripsModule } from './trips/trips.module';
// import { LiveSessionsModule } from './live-sessions/live-sessions.module';
// import { PassengersModule } from './passengers/passengers.module';
import { ConductorsModule } from './conductors/conductors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
        const isDev = nodeEnv === 'development';

        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: isDev,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),

    DriversModule,
    VehiclesModule,
    RoutesModule,
    SchedulesModule,
    TripsModule,
    ConductorsModule,
    // LiveSessionsModule,
    // PassengersModule,
  ],
})
export class AppModule {
  private readonly logger = new Logger('DatabaseConnection');
  constructor(private dataSource: DataSource) {
    if (this.dataSource.isInitialized) {
      this.logger.log('🚀 Berhasil terhubung ke database Supabase!');
    } else {
      this.logger.error('❌ Gagal terhubung ke database Supabase.');
    }
  }
}