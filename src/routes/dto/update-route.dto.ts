import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteDto } from './create-route.dto';
import { RouteDirection } from '../entities/route.entity';
import { Type } from 'class-transformer';

export class UpdateRouteDto extends PartialType(CreateRouteDto) {
  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEnum(RouteDirection)
  direction!: RouteDirection;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @IsOptional()
  @IsNumber()
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRoutePointDto)
  points?: UpdateRoutePointDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRouteStopDto)
  stops?: UpdateRouteStopDto[];
}

export class UpdateRoutePointDto extends PartialType(CreateRouteDto) {
  @IsNotEmpty()
  @IsNumber()
  sequence!: number;

  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @IsNotEmpty()
  @IsNumber()
  longitude!: number;
}

export class UpdateRouteStopDto extends PartialType(CreateRouteDto) {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  sequence!: number;

  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsNumber()
  radiusMeter?: number;

  @IsOptional()
  @IsBoolean()
  isTerminal?: boolean;
}
