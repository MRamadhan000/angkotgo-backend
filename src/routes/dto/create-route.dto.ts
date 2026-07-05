import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RouteDirection } from '../entities/route.entity';

export class CreateRouteDto {
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
    @Type(() => CreateRoutePointDto)
    points?: CreateRoutePointDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRouteStopDto)
    stops?: CreateRouteStopDto[];
}


export class CreateRoutePointDto {
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


export class CreateRouteStopDto {
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
