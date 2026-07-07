import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, ParseArrayPipe } from '@nestjs/common';
import { RouteStopsService } from '../services/route-stops.service';
import { CreateRouteStopDto } from '../dto/create-route.dto';
import { RouteStop } from '../entities/route-stop.entity';

@Controller('routes/:routeId/stops')
export class RouteStopsController {
    constructor(private readonly routeStopsService: RouteStopsService) { }
    @Post('bulk')
    async createBulk(
        @Param('routeId', ParseIntPipe) routeId: number,
        @Body(new ParseArrayPipe({ items: CreateRouteStopDto }))
        createRouteStopDtos: CreateRouteStopDto[],
    ): Promise<RouteStop[]> {
        return await this.routeStopsService.createBulk(routeId, createRouteStopDtos);
    }

    // POST /routes/:routeId/stops
    @Post()
    async create(
        @Param('routeId', ParseIntPipe) routeId: number,
        @Body() createRouteStopDto: CreateRouteStopDto,
    ): Promise<RouteStop> {
        return await this.routeStopsService.create(routeId, createRouteStopDto);
    }

    // GET /routes/:routeId/stops
    @Get()
    async findByRoute(@Param('routeId', ParseIntPipe) routeId: number): Promise<RouteStop[]> {
        return await this.routeStopsService.findByRoute(routeId);
    }

    // DELETE /routes/:routeId/stops/:id
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        return await this.routeStopsService.remove(id);
    }
}
