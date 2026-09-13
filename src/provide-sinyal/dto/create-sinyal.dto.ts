import {
  IsNumber,
  IsOptional,
  IsString,
  IsLatitude,
  IsLongitude,
  IsArray,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { DirectionType } from '../entities/provide-sinyal.entity';

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

  // ─── Field Target / Destinasi ───
  @IsOptional()
  @IsNumber()
  @IsLatitude()
  targetLat?: number;

  @IsOptional()
  @IsNumber()
  @IsLongitude()
  targetLng?: number;

  // ─── Field Nama Lokasi Asal & Tujuan ───
  @IsOptional()
  @IsString()
  sourceName?: string;

  @IsOptional()
  @IsString()
  destName?: string;

  // ─── Field Route & Direction ───
  @IsOptional()
  @IsNumber()
  routeId?: number;

  @IsOptional()
  @IsEnum(DirectionType)
  direction?: DirectionType;

  // VehicleAssignmentId opsional saat penentuan di awal
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleAssignmentId?: string[];
}