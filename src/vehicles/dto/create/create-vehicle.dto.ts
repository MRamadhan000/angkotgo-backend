import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsInt, 
  Min, 
  MaxLength, 
  IsOptional 
} from 'class-validator';
import { VehicleStatus, VehicleType } from 'src/vehicles/enum/vehicle.enum';

export class CreateVehicleDto {
  @IsString({ message: 'Nomor plat harus berupa teks.' })
  @IsNotEmpty({ message: 'Nomor plat tidak boleh kosong.' })
  @MaxLength(15, { message: 'Nomor plat maksimal 15 karakter.' })
  plateNumber!: string;

  @IsString({ message: 'Kode kendaraan harus berupa teks.' })
  @IsNotEmpty({ message: 'Kode kendaraan tidak boleh kosong.' })
  @MaxLength(20, { message: 'Kode kendaraan maksimal 20 karakter.' })
  vehicleCode!: string;

  @IsInt({ message: 'Kapasitas harus berupa angka bulat.' })
  @Min(0, { message: 'Kapasitas minimal adalah 0.' })
  @IsOptional()
  capacity?: number;

  @IsInt({ message: 'Odometer saat ini harus berupa angka bulat.' })
  @Min(0, { message: 'Odometer minimal adalah 0.' })
  @IsOptional()
  currentOdometer?: number;

  @IsEnum(VehicleStatus, { message: 'Status kendaraan tidak valid.' })
  @IsOptional()
  status?: VehicleStatus;
  
  @IsEnum(VehicleType)
  @IsOptional()
  type?: VehicleType;
}