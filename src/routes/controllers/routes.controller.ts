import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { CreateRouteDto } from '../dto/create/create-route.dto';
import { UpdateRouteDto } from '../dto/update/update-route.dto';
import { Route } from '../entities/route.entity';
import { RoutesService } from '../services/routes.service';
import { FindUpcomingVehiclesDto } from '../dto/find-upcoming-vehicles.dto';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRouteDto: CreateRouteDto): Promise<{ message: string; data: Route }> {
    const data = await this.routesService.create(createRouteDto);
    return {
      message: 'Trayek baru berhasil ditambahkan.',
      data,
    };
  }

  @Get('upcoming-vehicles')
  findUpcomingVehicles(@Query() dto: FindUpcomingVehiclesDto) {
    return this.routesService.findUpcomingVehiclesForUser(
      dto.routeId,
      dto.direction,
      dto.latitude,
      dto.longitude,
    );
  }

  @Get('search')
  async searchRoute(
    @Query('userLat') userLat: number,
    @Query('userLng') userLng: number,
    @Query('destLat') destLat: number,
    @Query('destLng') destLng: number,
  ) {
    return await this.routesService.findAvailableRoutesForJourney(
      Number(userLat),
      Number(userLng),
      Number(destLat),
      Number(destLng),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<{ message: string; data: Route[] }> {
    const data = await this.routesService.findAll();
    return {
      message: 'Berhasil mengambil seluruh data trayek.',
      data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; data: Route }> {
    const data = await this.routesService.findOne(id);
    return {
      message: `Berhasil mengambil detail trayek dengan ID ${id}.`,
      data,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRouteDto: UpdateRouteDto
  ): Promise<{ message: string; data: Route }> {
    const data = await this.routesService.update(id, updateRouteDto);
    return {
      message: `Trayek dengan ID ${id} berhasil diperbarui.`,
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.routesService.remove(id);

    return {
      message: `Trayek dengan ID ${id} berhasil dihapus.`,
    };
  }
}