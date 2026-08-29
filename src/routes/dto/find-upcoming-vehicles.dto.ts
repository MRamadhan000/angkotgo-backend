import { IsEnum, IsLatitude, IsLongitude, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { DirectionType } from '../enums/route.enum';

export class FindUpcomingVehiclesDto {
  @Type(() => Number)
  @IsInt()
  routeId!: number;

  @IsEnum(DirectionType)
  direction!: DirectionType;

  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;
}