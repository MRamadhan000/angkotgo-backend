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
import { RouteStopsService } from '../services/route-stops.service';
import { RouteStop } from '../entities/route-stop.entity';
import { CreateRouteStopDto } from '../dto/create/create-route-stop.dto';
import { UpdateRouteStopDto } from '../dto/update/update-route-stop.dto';

@Controller('route-stops')
export class RouteStopsController {
    constructor(private readonly routeStopsService: RouteStopsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createRouteStopDto: CreateRouteStopDto): Promise<{ message: string; data: RouteStop }> {
        const data = await this.routeStopsService.create(createRouteStopDto);
        return {
            message: 'Halte baru berhasil ditambahkan.',
            data,
        };
    }

    @Post('bulk')
    async createBulk(@Body() createRouteStopsDto: CreateRouteStopDto[]) {
        const stops = await this.routeStopsService.createBulk(createRouteStopsDto);
        return {
            message: 'Multiple route stops successfully created',
            data: stops,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findByRouteAndDirection(
        @Query('routeId', ParseIntPipe) routeId: number,
        @Query('direction') direction: string,
    ): Promise<{ message: string; data: RouteStop[] }> {
        const data = await this.routeStopsService.findByRouteAndDirection(routeId, direction);
        return {
            message: `Berhasil mengambil daftar halte untuk trayek ID ${routeId} (${direction}).`,
            data,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; data: RouteStop }> {
        const data = await this.routeStopsService.findOne(id);
        return {
            message: `Berhasil mengambil detail halte dengan ID ${id}.`,
            data,
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRouteStopDto: UpdateRouteStopDto
    ): Promise<{ message: string; data: RouteStop }> {
        const data = await this.routeStopsService.update(id, updateRouteStopDto);
        return {
            message: `Halte dengan ID ${id} berhasil diperbarui.`,
            data,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        return await this.routeStopsService.remove(id);
    }
}