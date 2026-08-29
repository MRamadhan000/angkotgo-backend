import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateRouteDto {
  @IsString({ message: 'Kode trayek harus berupa teks.' })
  @IsNotEmpty({ message: 'Kode trayek tidak boleh kosong.' })
  @MaxLength(10, { message: 'Kode trayek maksimal 10 karakter.' })
  routeCode!: string;

  @IsString({ message: 'Nama trayek harus berupa teks.' })
  @IsNotEmpty({ message: 'Nama trayek tidak boleh kosong.' })
  @MaxLength(100, { message: 'Nama trayek maksimal 100 karakter.' })
  routeName!: string;
}