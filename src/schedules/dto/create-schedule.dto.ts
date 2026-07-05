import { IsNotEmpty, IsInt, IsString, Matches } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsInt()
  driverId!: number;

  @IsNotEmpty()
  @IsInt()
  vehicleId!: number;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'workDate harus berformat YYYY-MM-DD' })
  workDate!: string;

  @IsNotEmpty()
  @IsInt()
  shift!: number;
}
