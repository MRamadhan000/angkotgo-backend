import { Controller, Post, Body, Get, Param ,Patch, Delete} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { Driver } from './entities/driver.entity';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { LoginDriverDto } from './dto/login-driver.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findAll(): Promise<Driver[]> {
    return await this.driversService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Driver> {
    return await this.driversService.findOne(id);
  }

  @Post()
  async create(@Body() createDriverDto: CreateDriverDto): Promise<Driver> {
    return await this.driversService.create(createDriverDto);
  }

  @Post('login')
  async login(@Body() loginDriverDto: LoginDriverDto): Promise<Driver> {
    return await this.driversService.login(loginDriverDto.phone);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() input: UpdateDriverDto): Promise<Driver> {
    return await this.driversService.update(id, input);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Driver> {
  return  await this.driversService.deactivate(id);
  }
}