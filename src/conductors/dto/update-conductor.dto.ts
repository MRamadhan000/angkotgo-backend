import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateConductorDto } from './create-conductor.dto';
import { ConductorStatus } from '../entities/conductor.entity';

export class UpdateConductorDto extends PartialType(CreateConductorDto) {
  @IsBoolean({ message: 'Status verifikasi harus berupa boolean.' })
  @IsOptional()
  isVerified?: boolean;

  @IsEnum(ConductorStatus, { message: 'Status kondektur tidak valid.' })
  @IsOptional()
  status?: ConductorStatus;
}