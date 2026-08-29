import { PartialType } from '@nestjs/mapped-types';
import { CreateRoutePathDto } from '../create/create-route-path.dto';

export class UpdateRoutePathDto extends PartialType(CreateRoutePathDto) {}