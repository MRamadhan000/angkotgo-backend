import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleAssignmentDto } from '../create/create-vehicle-assignment.dto';
import { IsInt } from 'class-validator';

export class UpdateVehicleAssignmentDto extends PartialType(
  CreateVehicleAssignmentDto,
) {
  @IsInt()
  currentPassengers?: number;
}
