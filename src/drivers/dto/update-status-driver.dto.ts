import { IsEnum, IsNotEmpty } from 'class-validator';
import { DriverStatus } from '../entities/driver.entity';

export class UpdateStatusDto {
  @IsEnum(DriverStatus, { message: 'Status driver tidak valid (pilih: ACTIVE, OFF_DUTY, SUSPENDED)' })
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status!: DriverStatus;
}