import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    BadRequestException
} from '@nestjs/common';
import { CreateVehicleAssignmentDto } from '../dto/create/create-vehicle-assignment.dto';
import { UpdateVehicleAssignmentDto } from '../dto/update/update-vehicle-assignment.dto';
import { VehicleAssignmentsService } from '../services/vehicle-assignments.service';

@Controller('vehicle-assignments')
export class VehicleAssignmentsController {
    constructor(private readonly assignmentsService: VehicleAssignmentsService) { }

    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    async createBulk(@Body() createDtos: CreateVehicleAssignmentDto[]) {
        const data = await this.assignmentsService.createBulk(createDtos);
        return {
            message: `${data.length} penugasan kendaraan berhasil dibuat secara massal.`,
            data,
        };
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateVehicleAssignmentDto) {
        const data = await this.assignmentsService.create(createDto);
        return {
            message: 'Penugasan kendaraan berhasil dibuat.',
            data,
        };
    }

    @Get('schedules')
    async getAllDriversSchedules(@Query('date') date: string) {
        if (!date) {
            throw new BadRequestException('Parameter query "date" dengan format YYYY-MM-DD wajib diisi.');
        }

        const data = await this.assignmentsService.getAllDriversScheduleWithEstimatedArrival(date);
        return {
            message: `Berhasil mengambil seluruh jadwal penugasan dan estimasi waktu halte untuk tanggal ${date}.`,
            data,
        };
    }

    @Get('active-schedule-by-personnel')
    async getActiveScheduleByPersonnel(
        @Query('date') date: string,
        @Query('driverId') driverId?: string,
        @Query('conductorId') conductorId?: string,
    ) {
        const parsedDriverId = driverId ? parseInt(driverId, 10) : undefined;
        const parsedConductorId = conductorId ? parseInt(conductorId, 10) : undefined;

        const data = await this.assignmentsService.getActiveScheduleByPersonnel({
            targetDate: date,
            driverId: parsedDriverId,
            conductorId: parsedConductorId,
        });

        return {
            message: 'Berhasil mengambil jadwal aktif penugasan berdasarkan personel.',
            data,
        };
    }


    @Get('driver/:driverId/history')
    async getDriverTripHistory(@Param('driverId', ParseIntPipe) driverId: number) {
        const data = await this.assignmentsService.getAllDriverTripHistory(driverId);
        return {
            message: `Berhasil mengambil riwayat trip untuk driver ID ${driverId}.`,
            data,
        };
    }

    @Get('conductor/:conductorId/history')
    async getConductorTripHistory(@Param('conductorId', ParseIntPipe) conductorId: number) {
        const data = await this.assignmentsService.getAllConductorTripHistory(conductorId);
        return {
            message: `Berhasil mengambil riwayat trip untuk kondektur ID ${conductorId}.`,
            data,
        };
    }

    @Get()
    async findAll(
        @Query('vehicleId') vehicleId?: string,
        @Query('date') date?: string,
    ) {
        const parsedVehicleId = vehicleId ? parseInt(vehicleId, 10) : undefined;
        const data = await this.assignmentsService.findAll(parsedVehicleId, date);

        return {
            message: 'Berhasil mengambil daftar penugasan kendaraan.',
            data,
        };
    }

    @Get(':id')
    async getVehicleAssignmentById(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const data = await this.assignmentsService.getVehicleAssignmentById(id);
        return {
            message: `Berhasil mengambil detail penugasan kendaraan dengan ID ${id}.`,
            data,
        };
    }
    
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateVehicleAssignmentDto,
    ) {
        const data = await this.assignmentsService.update(id, updateDto);
        return {
            message: `Data penugasan ID ${id} berhasil diperbarui.`,
            data,
        };
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.assignmentsService.remove(id);
    }
}