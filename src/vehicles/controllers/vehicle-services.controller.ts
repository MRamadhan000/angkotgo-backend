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
  HttpStatus 
} from '@nestjs/common';
import { CreateVehicleServiceDto } from '../dto/create/create-vehicle-service.dto';
import { UpdateVehicleServiceDto } from '../dto/update/update-vehicle-service.dto';
import { VehicleServicesService } from '../services/vehicle-services.service';

@Controller('vehicle-services')
export class VehicleServicesController {
  constructor(private readonly vehicleServicesService: VehicleServicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateVehicleServiceDto) {
    const data = await this.vehicleServicesService.create(createDto);
    return {
      message: 'Riwayat servis berhasil dicatat.',
      data,
    };
  }

  @Get()
  async findAll(@Query('vehicleId') vehicleId?: string) {
    // Mendukung opsional query parameter: GET /vehicle-services?vehicleId=1
    const parsedVehicleId = vehicleId ? parseInt(vehicleId, 10) : undefined;
    const data = await this.vehicleServicesService.findAll(parsedVehicleId);
    
    return {
      message: 'Berhasil mengambil daftar riwayat servis.',
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
    @Body() updateDto: UpdateVehicleServiceDto,
  ) {
    const data = await this.vehicleServicesService.update(id, updateDto);
    return {
      message: `Data servis ID ${id} berhasil diperbarui.`,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.vehicleServicesService.remove(id);
  }
}