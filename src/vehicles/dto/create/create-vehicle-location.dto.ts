import { IsNumber, IsNotEmpty } from 'class-validator';

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
}