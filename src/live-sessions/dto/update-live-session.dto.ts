import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

import { SessionStatus } from '../entities/live-session.entity';

export class UpdateLiveSessionDto {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  currentStopId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  currentSequence?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  nextStopId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  nextSequence?: number;

  @IsOptional()
  @IsBoolean()
  isAtStop?: boolean;
}