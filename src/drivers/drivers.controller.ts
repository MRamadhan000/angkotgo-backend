import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { LoginDriverDto } from './dto/login-driver.dto';
import { UpdateStatusDto } from './dto/update-status-driver.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  @Get()
  async findAll() {
    const drivers = await this.driversService.findAll();
    return {
      message: 'Successfully retrieved all drivers',
      data: drivers,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const driver = await this.driversService.findOne(id);
    return {
      message: 'Successfully retrieved driver details',
      data: driver,
    };
  }

  @Post()
  async create(@Body() createDriverDto: CreateDriverDto) {
    const newDriver = await this.driversService.create(createDriverDto);
    return {
      message: 'Driver successfully registered',
      data: newDriver,
    };
  }

  @Post('login')
  async login(@Body() loginDriverDto: LoginDriverDto) {
    const driver = await this.driversService.login(
      loginDriverDto.email,
      loginDriverDto.password
    );
    return {
      message: 'Login successful',
      data: driver,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateDriverDto
  ) {
    const updatedDriver = await this.driversService.update(id, input);
    return {
      message: 'Driver successfully updated',
      data: updatedDriver,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    const updatedDriver = await this.driversService.updateStatus(id, updateStatusDto.status);
    return {
      message: `Driver status successfully updated to ${updateStatusDto.status}`,
      data: updatedDriver,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deactivatedDriver = await this.driversService.deactivate(id);
    return {
      message: 'Driver successfully deactivated',
      data: deactivatedDriver,
    };
  }
}