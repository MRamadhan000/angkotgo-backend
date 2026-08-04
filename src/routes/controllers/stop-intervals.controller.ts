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
  constructor(private readonly stopIntervalsService: StopIntervalsService) {}

  // 1. CREATE: Menambahkan interval baru
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStopIntervalDto: CreateStopIntervalDto): Promise<{ message: string; data: StopInterval }> {
    const data = await this.stopIntervalsService.create(createStopIntervalDto);
    return {
      message: 'Interval durasi antar halte berhasil ditambahkan.',
      data,
    };
  }

  // 2. READ: Mengambil daftar interval berdasarkan routeId dan direction
  // Contoh URL: /stop-intervals?routeId=1&direction=FORWARD
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

  // 3. READ (ONE): Mengambil detail satu interval berdasarkan ID
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; data: StopInterval }> {
    const data = await this.stopIntervalsService.findOne(id);
    return {
      message: `Berhasil mengambil detail interval halte dengan ID ${id}.`,
      data,
    };
  }

  // 4. UPDATE: Memperbarui interval berdasarkan ID
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

  // 5. DELETE: Menghapus interval berdasarkan ID
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.stopIntervalsService.remove(id);
  }
}