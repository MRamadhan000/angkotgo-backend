import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  vehicleAssignmentId!: number;

  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType!: PaymentType;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount!: number;
}