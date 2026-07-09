// dto/update-schedule.dto.ts
import { IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { TripStatus } from 'src/trips/entities/trip.entity';

export class UpdateScheduleDto {
  @IsOptional()
  @IsDateString()
  workDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  shift?: number;

  @IsOptional()
  @IsDateString() // Menggunakan IsDateString jika dikirim dalam bentuk string ISO/Date dari client
  createdAt?: Date;
  
//   @IsOptional()
//   status? : TripStatus
}
