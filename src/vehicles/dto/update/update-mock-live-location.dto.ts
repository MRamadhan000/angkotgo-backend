import { PartialType } from '@nestjs/mapped-types';
import { CreateMockLiveLocationDto } from '../create/create-mock-live-location.dto';

export class UpdateMockLiveLocationDto extends PartialType(
    CreateMockLiveLocationDto,
) {}