import { IsEnum, IsInt, IsNumber, IsNotEmpty } from 'class-validator';
import { DirectionType } from '../../enums/route.enum'

export class CreateStopIntervalDto {
    @IsInt({ message: 'ID trayek harus berupa angka bulat.' })
    @IsNotEmpty({ message: 'ID trayek tidak boleh kosong.' })
    routeId!: number;

    @IsEnum(DirectionType, { message: 'Arah harus bernilai FORWARD atau RETURN.' })
    @IsNotEmpty({ message: 'Arah trayek tidak boleh kosong.' })
    direction!: DirectionType;

    @IsInt({ message: 'ID halte asal harus berupa angka.' })
    @IsNotEmpty({ message: 'ID halte asal tidak boleh kosong.' })
    fromStopId!: number;

    @IsInt({ message: 'ID halte tujuan harus berupa angka.' })
    @IsNotEmpty({ message: 'ID halte tujuan tidak boleh kosong.' })
    toStopId!: number;

    @IsInt({ message: 'Durasi dalam detik harus berupa angka bulat.' })
    @IsNotEmpty({ message: 'Durasi tidak boleh kosong.' })
    durationInSeconds!: number;

    @IsNumber({}, { message: 'Jarak dalam meter harus berupa angka.' })
    @IsNotEmpty({ message: 'Jarak tidak boleh kosong.' })
    distanceInMeters!: number;
}