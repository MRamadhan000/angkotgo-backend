import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from '../create/create-vehicle.dto';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}