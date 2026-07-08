import { PartialType } from '@nestjs/mapped-types';
import { CreateDriverDto } from './create-driver.dto';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { DriverStatus } from '../entities/driver.entity';

export class UpdateDriverDto extends PartialType(CreateDriverDto) {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsString()
  @Length(1, 20)
  phone!: string;

  @IsString()
  @Length(1, 50)
  licenseNumber!: string;

  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
