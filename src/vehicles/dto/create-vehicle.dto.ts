import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';
import { VehicleStatus } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 15)
  plateNumber!: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  vehicleCode!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  capacity!: number;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
