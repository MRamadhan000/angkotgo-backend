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

  @Get()
  findAll() {
    return this.liveSessionsService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLiveSessionDto,
  ) {
    return this.liveSessionsService.update(id, dto);
  }


  // POST /live-sessions (Mulai Sesi Driver Baru)
  @Post()
  async startSession(@Body() createLiveSessionDto: CreateLiveSessionDto) {
    return await this.liveSessionsService.create(createLiveSessionDto);
  }

  // POST /live-sessions/:id/locations (Tembak koordinat GPS real-time ping dari IoT/App Driver)
  @Post(':id/locations')
  async addLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() addLiveLocationDto: AddLiveLocationDto,
  ) {
    return await this.liveSessionsService.addLocation(id, addLiveLocationDto);
  }

  // GET /live-sessions/:id (Melihat rute tracking maps beserta array koordinatnya)
  @Get(':id')
  async getSessionWithTracking(@Param('id', ParseIntPipe) id: number) {
    return await this.liveSessionsService.getSessionWithTracking(id);
  }

  // PATCH /live-sessions/:id/end (Mengakhiri Sesi)
  @Patch(':id/end')
  async endSession(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: SessionStatus,
  ) {
    return await this.liveSessionsService.endSession(id, status);
  }

  @Patch(':id/stop')
  updateStopStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStopStatusDto,
  ) {
    return this.liveSessionsService.updateStopStatus(id, dto.isAtStop);
  }
}
