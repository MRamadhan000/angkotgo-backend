import {
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';
import { PaymentMethod } from '../enum/booking.enum';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  userId!: number;

  @IsNotEmpty()
  @IsInt()
  vehicleAssignmentId!: number;

  @IsNotEmpty()
  @IsInt()
  passengerCount!: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
