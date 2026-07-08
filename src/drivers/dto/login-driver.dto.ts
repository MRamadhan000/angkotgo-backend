import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDriverDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  phone!: string;
}
