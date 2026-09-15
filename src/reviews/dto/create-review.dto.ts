import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @IsNotEmpty()
  userId!: number;

  @IsInt()
  @IsNotEmpty()
  vehicleAssignmentId!: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  description?: string;
}