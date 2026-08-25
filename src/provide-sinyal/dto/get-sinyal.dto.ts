import { IsNotEmpty, IsString } from 'class-validator';

export class GetActiveSinyalDto {
  @IsString()
  @IsNotEmpty()
  vehicleAssignmentId!: string;
}
