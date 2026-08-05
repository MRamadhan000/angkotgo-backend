import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleLocationDto } from '../create/create-vehicle-location.dto';

export class UpdateVehicleLocationDto extends PartialType(CreateVehicleLocationDto) {}