// trips/dto/update-trip.dto.ts
import { IsOptional, IsEnum, IsString, Matches } from 'class-validator';
import { TripStatus } from '../entities/trip.entity';

export class UpdateTripDto {
    @IsOptional()
    tripNumber ? : number;

    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'plannedDeparture harus dalam format waktu yang valid (HH:MM atau HH:MM:SS)',
    })
    plannedDeparture?: string;

    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'plannedArrival harus dalam format waktu yang valid (HH:MM atau HH:MM:SS)',
    })
    plannedArrival?: string;

    @IsOptional()
    @IsEnum(TripStatus)
    status?: TripStatus;
}
