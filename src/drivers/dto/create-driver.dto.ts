import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { DriverStatus } from '../entities/driver.entity';

export class CreateDriverDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  phone!: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  licenseNumber!: string;

  @IsEnum(DriverStatus)
  status?: DriverStatus;
}