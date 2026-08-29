// src/vehicles/dto/create-vehicle-location.dto.ts
import { IsNumber, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { StopStatus } from 'src/vehicles/enum/vehicle.enum';

export class CreateVehicleLocationDto {
    @IsNotEmpty()
    @IsNumber()
    vehicleAssignmentId!: number;

    @IsNotEmpty()
    @IsNumber()
    latitude!: number;

    @IsNotEmpty()
    @IsNumber()
    longitude!: number;

    @IsOptional()
    @IsNumber()
    currentStopId?: number;

    @IsOptional()
    @IsEnum(StopStatus)
    stopStatus?: StopStatus;
}