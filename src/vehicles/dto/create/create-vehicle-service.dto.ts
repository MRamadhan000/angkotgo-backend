import { 
  IsInt, 
  IsNotEmpty, 
  IsEnum, 
  IsString, 
  IsNumber, 
  IsDateString, 
  Min, 
  IsOptional 
} from 'class-validator';
import { ServiceType } from 'src/vehicles/enum/vehicle.enum';

export class CreateVehicleServiceDto {
  @IsInt({ message: 'ID kendaraan harus berupa angka bulat.' })
  @IsNotEmpty({ message: 'ID kendaraan tidak boleh kosong.' })
  vehicleId!: number;

  @IsEnum(ServiceType, { message: 'Tipe servis tidak valid.' })
  @IsOptional()
  serviceType?: ServiceType;

  @IsString({ message: 'Deskripsi harus berupa teks.' })
  @IsNotEmpty({ message: 'Deskripsi servis tidak boleh kosong.' })
  description!: string;

  @IsNumber({}, { message: 'Biaya harus berupa angka desimal atau angka valid.' })
  @Min(0, { message: 'Biaya servis minimal adalah 0.' })
  @IsOptional()
  cost?: number;

  @IsInt({ message: 'Odometer saat servis harus berupa angka bulat.' })
  @IsNotEmpty({ message: 'Posisi odometer saat servis tidak boleh kosong.' })
  @Min(0, { message: 'Odometer minimal adalah 0.' })
  odometerAtService!: number;

  @IsDateString({}, { message: 'Tanggal servis harus berformat tanggal yang valid (YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'Tanggal servis tidak boleh kosong.' })
  serviceDate!: string; // Menggunakan string karena dari request body dikirim format YYYY-MM-DD

  @IsDateString({}, { message: 'Estimasi tanggal servis berikutnya harus berformat yang valid (YYYY-MM-DD).' })
  @IsOptional()
  nextServiceDate?: string;

  @IsInt({ message: 'Target KM servis berikutnya harus berupa angka bulat.' })
  @Min(0, { message: 'Target odometer minimal adalah 0.' })
  @IsOptional()
  nextServiceOdometer?: number;
}