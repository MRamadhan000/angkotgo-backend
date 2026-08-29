import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateVehicleServiceDto } from '../dto/create/create-vehicle-service.dto';
import { UpdateVehicleServiceDto } from '../dto/update/update-vehicle-service.dto';
import { VehicleServicesService } from '../services/vehicle-services.service';

@Controller('vehicle-services')
export class VehicleServicesController {
  constructor(
    private readonly vehicleServicesService: VehicleServicesService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateVehicleServiceDto) {
    const data = await this.vehicleServicesService.create(dto);

    return {
      message: 'Riwayat servis berhasil dicatat.',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.vehicleServicesService.findAll();

    return {
      message: 'Berhasil mengambil daftar riwayat servis.',
      data,
    };
  }

  @Get('vehicle/:vehicleId')
  async findByVehicleId(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ) {
    const data = await this.vehicleServicesService.findByVehicleId(vehicleId);

    return {
      message: 'Berhasil mengambil riwayat servis kendaraan.',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.vehicleServicesService.findOne(id);

    return {
      message: `Berhasil mengambil data servis ID ${id}.`,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVehicleServiceDto,
  ) {
    const data = await this.vehicleServicesService.update(id, dto);

    return {
      message: `Data servis ID ${id} berhasil diperbarui.`,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehicleServicesService.remove(id);
  }
}