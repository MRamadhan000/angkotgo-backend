import { IsInt, IsLatitude, IsLongitude, Min } from 'class-validator';

export class VehicleRealtimeDto {
    @IsInt()
    vehicleAssignmentId!: number;

    @IsLatitude()
    latitude!: number;

    @IsLongitude()
    longitude!: number;

    @IsInt()
    @Min(0)
    passengerCount!: number;
}