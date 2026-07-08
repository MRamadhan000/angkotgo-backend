import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  @Get()
   async findAll(): Promise<Vehicle[]> {
     return await this.vehiclesService.findAll();
   }
 
   @Get(':id')
   async findOne(@Param('id') id: number): Promise<Vehicle> {
     return await this.vehiclesService.findOne(id);
   }
 
   @Post()
   async create(@Body() createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
     return await this.vehiclesService.create(createVehicleDto);
   }
 
   @Patch(':id')
   async update(@Param('id') id: number, @Body() input: UpdateVehicleDto): Promise<Vehicle> {
     return await this.vehiclesService.update(id, input);
   }
 
   @Delete(':id')
   async remove(@Param('id') id: number): Promise<Vehicle> {
   return  await this.vehiclesService.deactivate(id);
   }
}
