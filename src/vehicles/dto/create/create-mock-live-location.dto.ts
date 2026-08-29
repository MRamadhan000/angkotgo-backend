import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DirectionType } from '../../enum/vehicle.enum';

export class CreateMockLiveLocationDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsInt()
    @Type(() => Number)
    routeId!: number;

    @IsEnum(DirectionType)
    direction!: DirectionType;

    @IsArray()
    @ArrayMinSize(2)
    @IsArray({ each: true })
    // lng lat
    coordinates!: [number, number][];
}