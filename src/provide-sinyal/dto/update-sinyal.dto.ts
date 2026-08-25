import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { SinyalStatus } from '../entities/provide-sinyal.entity';

export class UpdateSinyalDto {
  @IsEnum(SinyalStatus)
  status: SinyalStatus = SinyalStatus.COMPLETED;
}
