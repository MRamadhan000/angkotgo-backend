import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

import { Payment } from './entities/payment.entity';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      VehicleAssignment,
    ]),
  ],

  controllers: [
    PaymentsController,
  ],

  providers: [
    PaymentsService,
  ],

  exports: [
    PaymentsService,
  ],
})
export class PaymentsModule {}