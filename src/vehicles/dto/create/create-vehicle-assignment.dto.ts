import { 
  IsInt, 
  IsNotEmpty, 
  IsEnum, 
  IsDateString, 
  IsString, 
  Min, 
  IsOptional, 
  Matches 
} from 'class-validator';
import { DirectionType, AssignmentStatus } from 'src/vehicles/enum/vehicle.enum';

export class CreateVehicleAssignmentDto {
  @IsInt({ message: 'ID kendaraan harus berupa angka bulat.' })
  @IsNotEmpty({ message: 'ID kendaraan tidak boleh kosong.' })
  vehicleId!: number;

  @IsInt({ message: 'ID pengemudi harus berupa angka bulat.' })
  @IsNotEmpty({ message: 'ID pengemudi tidak boleh kosong.' })
  driverId!: number;

  @IsInt({ message: 'ID kondektur harus berupa angka bulat.' })
  @IsOptional()
  conductorId?: number; // Ditambahkan karena opsional / bisa kosong

  @IsInt({ message: 'ID trayek harus berupa angka bulat.' })
  @IsNotEmpty({ message: 'ID trayek tidak boleh kosong.' })
  routeId!: number;

  @IsEnum(DirectionType, { message: 'Arah perjalanan tidak valid.' })
  @IsOptional()
  direction?: DirectionType;

  @IsDateString({}, { message: 'Tanggal penugasan harus berformat tanggal yang valid (YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'Tanggal penugasan tidak boleh kosong.' })
  assignmentDate!: string;

  @IsString({ message: 'Jam mulai harus berupa teks.' })
  @IsNotEmpty({ message: 'Jam mulai tidak boleh kosong.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { 
    message: 'Format jam mulai harus HH:MM atau HH:MM:SS (contoh: 08:00:00).' 
  })
  startTime!: string;

  @IsString({ message: 'Jam selesai harus berupa teks.' })
  @IsNotEmpty({ message: 'Jam selesai tidak boleh kosong.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, { 
    message: 'Format jam selesai harus HH:MM atau HH:MM:SS (contoh: 16:00:00).' 
  })
  endTime!: string;

  @IsEnum(AssignmentStatus, { message: 'Status penugasan tidak valid.' })
  @IsOptional()
  status?: AssignmentStatus;
}