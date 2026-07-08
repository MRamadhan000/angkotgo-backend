import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsEnum, IsNotEmpty, IsString, Length,IsInt,Min,IsOptional } from 'class-validator';
import { VehicleStatus } from '../entities/vehicle.entity';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
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
