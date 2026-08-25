import {
  IsString,
  IsNotEmpty,
  IsNumber
} from 'class-validator';

export class CreateCostDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama Tarif tidak boleh kosong' })
  name!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Nominal tidak boleh kosong' })
  nominal!: number;
}
