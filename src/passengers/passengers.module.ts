import { Module } from '@nestjs/common';
import { PassengerController } from './passengers.controller';
import { PassengerService } from './passengers.service';

@Module({
  imports: [], // Jika ke depan pakai Redis, daftarkan CacheModule di sini
  controllers: [PassengerController],
  providers: [PassengerService],
})
export class PassengersModule {}
