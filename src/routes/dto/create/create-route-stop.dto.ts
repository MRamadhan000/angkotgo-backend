import { IsEnum, IsString, IsNumber, IsNotEmpty, IsInt, MaxLength } from 'class-validator';
import { DirectionType } from '../../enums/route.enum'

export class CreateRouteStopDto {
    @IsInt({ message: 'ID trayek harus berupa angka bulat.' })
    @IsNotEmpty({ message: 'ID trayek tidak boleh kosong.' })
    routeId!: number;

    @IsEnum(DirectionType, { message: 'Arah harus bernilai FORWARD atau RETURN.' })
    @IsNotEmpty({ message: 'Arah trayek tidak boleh kosong.' })
    direction!: DirectionType;

    @IsString({ message: 'Nama halte harus berupa teks.' })
    @IsNotEmpty({ message: 'Nama halte tidak boleh kosong.' })
    @MaxLength(100, { message: 'Nama halte maksimal 100 karakter.' })
    stopName!: string;

    @IsNumber({}, { message: 'Latitude halte harus berupa angka.' })
    @IsNotEmpty({ message: 'Latitude halte tidak boleh kosong.' })
    latitude!: number;

    @IsNumber({}, { message: 'Longitude halte harus berupa angka.' })
    @IsNotEmpty({ message: 'Longitude halte tidak boleh kosong.' })
    longitude!: number;

    @IsInt({ message: 'Urutan halte (stop order) harus berupa angka.' })
    @IsNotEmpty({ message: 'Urutan halte tidak boleh kosong.' })
    stopOrder!: number;
}