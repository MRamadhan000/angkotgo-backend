// live-sessions.controller.ts
import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { LiveSessionsService } from './live-sessions.service';
import { CreateLiveSessionDto } from './dto/create-live-session.dto';
import { AddLiveLocationDto } from './dto/add-live-location.dto';
import { SessionStatus } from './entities/live-session.entity';
import { UpdateLiveSessionDto } from './dto/update-live-session.dto';
import { UpdateStopStatusDto } from './dto/update-status-stop.dto';

@Controller('live-sessions')
export class LiveSessionsController {
  constructor(private readonly liveSessionsService: LiveSessionsService) { }

  // 1. GET /live-sessions (Melihat semua sesi)
  @Get()
  async findAll() {
    return await this.liveSessionsService.findAll();
  }

  // 2. POST /live-sessions (Mulai Sesi Driver Baru - Sudah include validasi trip ganda)
  @Post()
  async startSession(@Body() createLiveSessionDto: CreateLiveSessionDto) {
    return await this.liveSessionsService.create(createLiveSessionDto);
  }

  // 3. GET /live-sessions/:id (Melihat rute tracking maps beserta array koordinatnya)
  @Get(':id')
  async getSessionWithTracking(@Param('id', ParseIntPipe) id: number) {
    return await this.liveSessionsService.getSessionWithTracking(id);
  }

  // 4. PATCH /live-sessions/:id (Update umum data sesi)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLiveSessionDto,
  ) {
    return await this.liveSessionsService.update(id, dto);
  }

  // 5. POST /live-sessions/:id/locations (Ping koordinat GPS real-time dari IoT/App Driver)
  @Post(':id/locations')
  async addLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() addLiveLocationDto: AddLiveLocationDto,
  ) {
    return await this.liveSessionsService.addLocation(id, addLiveLocationDto);
  }

  // 6. PATCH /live-sessions/:id/end (Mengakhiri Sesi)
  @Patch(':id/end')
  async endSession(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: SessionStatus,
  ) {
    return await this.liveSessionsService.endSession(id, status);
  }

  // 7. PATCH /live-sessions/:id/stop (Update status apakah angkot sedang di halte atau jalan)
  @Patch(':id/stop')
  async updateStopStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStopStatusDto,
  ) {
    return await this.liveSessionsService.updateStopStatus(id, dto.isAtStop);
  }
}