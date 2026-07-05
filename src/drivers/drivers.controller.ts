import { Controller, Post, Body, Get } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { Driver } from './entities/driver.entity';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  @Post()
  async create(@Body() createDriverDto: CreateDriverDto): Promise<Driver> {
    return await this.driversService.create(createDriverDto);
  }

  @Get()
  async findAll(): Promise<Driver[]> {
    return await this.driversService.findAll();
  }
}