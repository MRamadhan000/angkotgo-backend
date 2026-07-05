import { IsNotEmpty, IsNumber, IsInt, IsOptional } from 'class-validator';

export class AddLiveLocationDto {
  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @IsNotEmpty()
  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsInt()
  speedKmh?: number;

  @IsOptional()
  @IsInt()
  headingDegrees?: number;
}