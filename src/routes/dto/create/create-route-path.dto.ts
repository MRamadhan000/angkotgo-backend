import { IsEnum, IsNumber, IsNotEmpty, IsInt } from 'class-validator';
import { DirectionType } from '../../enums/route.enum'

export class CreateRoutePathDto {
    @IsInt({ message: 'ID trayek harus berupa angka bulat.' })
    @IsNotEmpty({ message: 'ID trayek tidak boleh kosong.' })
    routeId!: number;

    @IsEnum(DirectionType, { message: 'Arah harus bernilai FORWARD atau RETURN.' })
    @IsNotEmpty({ message: 'Arah trayek tidak boleh kosong.' })
    direction!: DirectionType;

    @IsNumber({}, { message: 'Latitude harus berupa angka koordinat.' })
    @IsNotEmpty({ message: 'Latitude tidak boleh kosong.' })
    latitude!: number;

    @IsNumber({}, { message: 'Longitude harus berupa angka koordinat.' })
    @IsNotEmpty({ message: 'Longitude tidak boleh kosong.' })
    longitude!: number;

    @IsInt({ message: 'Urutan titik (sequence order) harus berupa angka.' })
    @IsNotEmpty({ message: 'Urutan titik tidak boleh kosong.' })
    sequenceOrder!: number;
}