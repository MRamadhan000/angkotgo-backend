import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { SinyalService } from './sinyal.service';
import { CreateSinyalDto } from './dto/create-sinyal.dto';
import { UpdateSinyalDto } from './dto/update-sinyal.dto';
import { GetActiveSinyalDto } from './dto/get-sinyal.dto';

@Controller('sinyal')
export class SinyalController {
  constructor(private readonly sinyalService: SinyalService) {}

  // Endpoint 1: Penumpang membuat sinyal baru
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSinyal(@Body() createSinyalDto: CreateSinyalDto) {
    return await this.sinyalService.create(createSinyalDto);
  }

  // Endpoint 2: Driver mendapatkan daftar sinyal aktif di sekitarnya
  @Get('active')
  async getActiveSinyal(@Query() query: GetActiveSinyalDto) {
    return await this.sinyalService.findActiveSinyalByVehicle(
      query.vehicleAssignmentId,
    );
  }

  // Endpoint 3: Driver menerima/klaim sinyal tertentu
  @Put(':id/completed')
  async acceptSinyal(
    @Param('id') id: string,
    @Body() updateSinyalDto: UpdateSinyalDto,
  ) {
    return await this.sinyalService.updateSinyal(id, updateSinyalDto);
  }
}
