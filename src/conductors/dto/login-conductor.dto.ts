import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginConductorDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;

  @IsString({ message: 'Password harus berupa teks.' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  @MinLength(6, { message: 'Password minimal 6 karakter.' })
  password!: string;
}