import {
  IsNumber,
  IsOptional,
  IsString,
  IsLatitude,
  IsLongitude,
  IsArray,
} from 'class-validator';

export class CreateSinyalDto {
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
