import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentGateway } from './gateway/payment.gateway';

import { Payment } from './entities/payment.entity';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import { User } from 'src/user/entities/user.entitiy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      VehicleAssignment,
      User,
    ]),
  ],

  controllers: [
    PaymentsController,
  ],

  providers: [
    PaymentsService,
    PaymentGateway,
  ],

  exports: [
    PaymentsService,
    PaymentGateway,
  ],
})
export class PaymentsModule {}