import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { DirectionType } from '../../enum/vehicle.enum';

export class CreateScheduleTemplateDto {
    @IsInt()
    @IsNotEmpty()
    routeId!: number;

    @IsOptional()
    @IsInt()
    vehicleId?: number;

    @IsOptional()
    @IsInt()
    driverId?: number;

    @IsOptional()
    @IsInt()
    conductorId?: number;

    @IsInt()
    @IsNotEmpty()
    mockLiveLocationId!: number;

    @IsString()
    @IsNotEmpty()
    startTime!: string;

    @IsString()
    @IsNotEmpty()
    endTime!: string;

    @IsOptional()
    @IsEnum(DirectionType)
    direction?: DirectionType;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Min(1, { each: true })
    @Max(7, { each: true })
    activeDays?: number[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}