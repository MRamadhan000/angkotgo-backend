import {
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';
import { TripStatus } from '../entities/trip.entity';

export class CreateTripDto {
  @IsNotEmpty()
  @IsInt()
  scheduleId!: number;

  @IsNotEmpty()
  @IsInt()
  routeId!: number;

  @IsNotEmpty()
  @IsInt()
  tripNumber!: number;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Format waktu harus HH:MM:SS',
  })
  plannedDeparture!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Format waktu harus HH:MM:SS',
  })
  plannedArrival!: string;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;
}