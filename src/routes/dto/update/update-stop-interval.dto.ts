import { PartialType } from '@nestjs/mapped-types';
import { DirectionType } from '../../enums/route.enum'
import { CreateStopIntervalDto } from '../create/create-stop-interval.dto';

export class UpdateStopIntervalDto extends PartialType(CreateStopIntervalDto) {}