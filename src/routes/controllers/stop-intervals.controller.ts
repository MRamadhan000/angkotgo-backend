import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { StopIntervalsService } from '../services/stop-intervals.service';
import { StopInterval } from '../entities/stop-interval.entity';
import { CreateStopIntervalDto } from '../dto/create/create-stop-interval.dto';
import { UpdateStopIntervalDto } from '../dto/update/update-stop-interval.dto';

@Controller('stop-intervals')
export class StopIntervalsController {
  constructor(private readonly stopIntervalsService: StopIntervalsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStopIntervalDto: CreateStopIntervalDto): Promise<{ message: string; data: StopInterval }> {
    const data = await this.stopIntervalsService.create(createStopIntervalDto);
    return {
      message: 'Interval durasi antar halte berhasil ditambahkan.',
      data,
    };
  }

  @Post('bulk')
  async createBulk(@Body() createStopIntervalDtos: CreateStopIntervalDto[]) {
    return await this.stopIntervalsService.createBulk(createStopIntervalDtos);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findByRouteAndDirection(
    @Query('routeId', ParseIntPipe) routeId: number,
    @Query('direction') direction: string,
  ): Promise<{ message: string; data: StopInterval[] }> {
    const data = await this.stopIntervalsService.findByRouteAndDirection(routeId, direction);
    return {
      message: `Berhasil mengambil daftar interval halte untuk trayek ID ${routeId} (${direction}).`,
      data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; data: StopInterval }> {
    const data = await this.stopIntervalsService.findOne(id);
    return {
      message: `Berhasil mengambil detail interval halte dengan ID ${id}.`,
      data,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStopIntervalDto: UpdateStopIntervalDto
  ): Promise<{ message: string; data: StopInterval }> {
    const data = await this.stopIntervalsService.update(id, updateStopIntervalDto);
    return {
      message: `Interval halte dengan ID ${id} berhasil diperbarui.`,
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.stopIntervalsService.remove(id);
  }
}