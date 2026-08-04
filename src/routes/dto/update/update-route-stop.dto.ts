import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteStopDto } from '../create/create-route-stop.dto';

export class UpdateRouteStopDto extends PartialType(CreateRouteStopDto) {}