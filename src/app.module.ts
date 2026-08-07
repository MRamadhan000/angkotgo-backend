import {
  Module,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { RoutesModule } from './routes/routes.module';
import { ConductorsModule } from './conductors/conductors.module';
import { UserModule } from './user/user.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const isDev =
          configService.get<string>('NODE_ENV') !== 'production';
        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: isDev,
          ssl: isDev
            ? false
            : {
              rejectUnauthorized: false,
            },
          retryAttempts: 5,
          retryDelay: 3000,
          logging: isDev,
          extra: {
            max: 10,
            min: 2,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
          },
        };
      },
    }),

    DriversModule,
    VehiclesModule,
    RoutesModule,
    ConductorsModule,
    UserModule,
    BookingsModule,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);
  constructor(private readonly dataSource: DataSource) { }

  async onModuleInit() {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');

        this.logger.log(
          '✅ Connected to PostgreSQL (Supabase)',
        );
      }
    } catch (err) {
      this.logger.error(
        '❌ Failed to connect to PostgreSQL',
        err,
      );
    }
  }
}