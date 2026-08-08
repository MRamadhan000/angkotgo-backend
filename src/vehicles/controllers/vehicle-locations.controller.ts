import { Controller, Get, Post, Delete, Body, Param, Query, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { CreateVehicleLocationDto } from '../dto/create/create-vehicle-location.dto';
import { VehicleLocationsService } from '../services/vehicle-locations.service';
import { UpdateVehicleLocationDto } from '../dto/update/update-vehicle-location.dto';

@Controller('vehicle-locations')
export class VehicleLocationsController {
    constructor(private readonly vehicleLocationsService: VehicleLocationsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateVehicleLocationDto) {
        const data = await this.vehicleLocationsService.create(createDto);
        return {
            message: 'Posisi real-time berhasil direkam.',
            data,
        };
    }

    @Post('start-session/:assignmentId')
    @HttpCode(HttpStatus.OK)
    async startSession(@Param('assignmentId') assignmentId: string) {
        const data = await this.vehicleLocationsService.startSession(+assignmentId);
        return {
            message: 'Sesi penugasan kendaraan berhasil dimuat.',
            data,
        };
    }

    @Get()
    async findAll(@Query('vehicleAssignmentId') vehicleAssignmentId?: string) {
        const data = await this.vehicleLocationsService.findAll(
            vehicleAssignmentId ? +vehicleAssignmentId : undefined,
        );
        return {
            message: 'Berhasil mengambil daftar data lokasi.',
            data,
        };
    }

    @Get('latest/:assignmentId')
    async findLatestByAssignmentId(@Param('assignmentId') assignmentId: string) {
        const data = await this.vehicleLocationsService.findLatestByAssignmentId(+assignmentId);
        return {
            message: 'Berhasil mengambil data lokasi terbaru.',
            data,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.vehicleLocationsService.findOne(+id);
        return {
            message: 'Berhasil mengambil detail data lokasi.',
            data,
        };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateVehicleLocationDto) {
        const data = await this.vehicleLocationsService.update(+id, updateDto);
        return {
            message: `Data lokasi dengan ID ${id} berhasil diperbarui.`,
            data,
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.vehicleLocationsService.remove(+id);
    }
}