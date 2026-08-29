import { IsString, IsNumber } from 'class-validator';

export class UpdateCostDto {
  @IsString()
  name!: string;

  @IsNumber()
  nominal!: number;
}
