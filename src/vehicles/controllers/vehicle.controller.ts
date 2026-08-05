import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  ParseIntPipe, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { CreateVehicleDto } from '../dto/create/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update/update-vehicle.dto';
import { VehiclesService } from '../services/vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    const data = await this.vehiclesService.create(createVehicleDto);
    return {
      message: 'Kendaraan berhasil ditambahkan.',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.vehiclesService.findAll();
    return {
      message: 'Berhasil mengambil daftar kendaraan.',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.vehiclesService.findOne(id);
    return {
      message: `Berhasil mengambil data kendaraan ID ${id}.`,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    const data = await this.vehiclesService.update(id, updateVehicleDto);
    return {
      message: `Kendaraan ID ${id} berhasil diperbarui.`,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.vehiclesService.remove(id);
  }
}