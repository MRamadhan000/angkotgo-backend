import { PartialType } from '@nestjs/mapped-types';
import { CreateDriverDto } from './create-driver.dto';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsObject,
  ValidateNested,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DriverStatus } from '../entities/driver.entity';

class BankAccountInfoDto {
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @IsString()
  @IsNotEmpty()
  accountHolderName!: string;
}

export class UpdateDriverDto extends PartialType(CreateDriverDto) {
  // Semua field dasar (name, nik, email, phone, password, licenseNumber, licenseExpiryDate, address)

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsInt()
  @IsOptional()
  vehicleId?: number;

  @IsEnum(DriverStatus, { message: 'Status driver tidak valid' })
  @IsOptional()
  status?: DriverStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  averageRating?: number;

  @IsInt()
  @IsOptional()
  totalTrips?: number;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BankAccountInfoDto)
  bankAccountInfo?: BankAccountInfoDto;
}
