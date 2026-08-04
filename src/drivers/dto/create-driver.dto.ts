import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'NIK tidak boleh kosong' })
  @MaxLength(16, { message: 'NIK maksimal 16 karakter' })
  @MinLength(16, { message: 'NIK harus 16 karakter' })
  nik!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  @MaxLength(20, { message: 'Nomor telepon maksimal 20 karakter' })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor SIM tidak boleh kosong' })
  @MaxLength(50, { message: 'Nomor SIM maksimal 50 karakter' })
  licenseNumber!: string;

  @IsDateString({}, { message: 'Format tanggal kedaluwarsa SIM harus valid (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Tanggal kedaluwarsa SIM tidak boleh kosong' })
  licenseExpiryDate!: string;

  @IsString()
  @IsOptional()
  address?: string;
}