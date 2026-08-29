import { 
  IsString, 
  IsNotEmpty, 
  IsEmail, 
  IsEnum, 
  MaxLength, 
  IsOptional, 
  MinLength 
} from 'class-validator';
import { ConductorStatus } from '../entities/conductor.entity';

export class CreateConductorDto {
  @IsString({ message: 'Nama harus berupa teks.' })
  @IsNotEmpty({ message: 'Nama tidak boleh kosong.' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter.' })
  name!: string;

  @IsString({ message: 'NIK harus berupa teks.' })
  @IsNotEmpty({ message: 'NIK tidak boleh kosong.' })
  @MaxLength(16, { message: 'NIK maksimal 16 karakter.' })
  nik!: string;

  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;

  @IsString({ message: 'Nomor telepon harus berupa teks.' })
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong.' })
  @MaxLength(20, { message: 'Nomor telepon maksimal 20 karakter.' })
  phone!: string;

  @IsString({ message: 'Password harus berupa teks.' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  @MinLength(6, { message: 'Password minimal 6 karakter.' })
  password!: string;

  @IsString({ message: 'Alamat harus berupa teks.' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'URL foto harus berupa teks.' })
  @IsOptional()
  photoUrl?: string;

  @IsEnum(ConductorStatus, { message: 'Status kondektur tidak valid.' })
  @IsOptional()
  status?: ConductorStatus;
}