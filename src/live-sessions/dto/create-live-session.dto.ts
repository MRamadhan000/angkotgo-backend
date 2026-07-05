import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateLiveSessionDto {
  @IsNotEmpty()
  @IsInt()
  tripId!: number;
}
