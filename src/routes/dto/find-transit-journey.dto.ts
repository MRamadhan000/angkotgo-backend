import { IsLatitude, IsLongitude, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FindTransitJourneyDto {
  @Type(() => Number)
  @IsLatitude()
  userLat!: number;

  @Type(() => Number)
  @IsLongitude()
  userLng!: number;

  @Type(() => Number)
  @IsLatitude()
  destLat!: number;

  @Type(() => Number)
  @IsLongitude()
  destLng!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(2000)
  directThresholdMeters?: number; // default 600m — di bawah ini dianggap "rute langsung sudah cukup baik"

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxLegCandidates?: number; // default 5
}