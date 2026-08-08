import { IsNotEmpty, IsEnum } from 'class-validator';
import { BookingStatus } from '../enum/booking.enum';

export class UpdateBookingDto {
  @IsNotEmpty()
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
