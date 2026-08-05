import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleAssignmentDto } from '../create/create-vehicle-assignment.dto';

export class UpdateVehicleAssignmentDto extends PartialType(CreateVehicleAssignmentDto) {}