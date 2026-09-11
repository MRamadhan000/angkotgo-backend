import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { RoutesModule } from './routes/routes.module';
import { ConductorsModule } from './conductors/conductors.module';
import { UserModule } from './user/user.module';
import { PaymentsModule } from './payments/payments.module';
import { ProvideSinyalModule } from './provide-sinyal/provide-sinyal.module';
import { CostsModule } from './tarif/costs.module';
import { RealtimeModule } from './realtime/realtime.module';
import { StatisticsModule } from './stats/stats.module';

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
        const databaseUrl = configService.get<string>('DATABASE_URL') ?? '';
        const isLocalDatabase = /localhost|127\.0\.0\.1/.test(databaseUrl);
        const isDev = configService.get<string>('NODE_ENV') !== 'production';
        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: isDev,
          ssl: isLocalDatabase
            ? false
            : {
                rejectUnauthorized: false,
              },
          retryAttempts: 5,
          retryDelay: 3000,
          logging: isDev,
          extra: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 10000,
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
          },
        };
      },
    }),

    DriversModule,
    VehiclesModule,
    RoutesModule,
    ConductorsModule,
    UserModule,
    PaymentsModule,
    ProvideSinyalModule,
    CostsModule,
    RealtimeModule,
    StatisticsModule,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');

        this.logger.log('✅ Connected to PostgreSQL (Supabase)');
      }
    } catch (err) {
      this.logger.error('❌ Failed to connect to PostgreSQL', err);
    }
  }
}
