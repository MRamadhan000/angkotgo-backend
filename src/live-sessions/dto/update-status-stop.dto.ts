import { IsBoolean } from 'class-validator';

export class UpdateStopStatusDto {
  @IsBoolean()
  isAtStop!: boolean;
}