import {
  IsNumber,
  IsOptional,
  IsString,
  IsLatitude,
  IsLongitude,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateSinyalDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;
  
  @IsNumber()
  @IsLatitude()
  latitude!: number;

  @IsNumber()
  @IsLongitude()
  longitude!: number;

  // VehicleAssignmentId opsional saat penentuan di awal
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleAssignmentId?: string[];
}
