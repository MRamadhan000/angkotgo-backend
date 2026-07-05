import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RoutePointsService } from '../services/route-points.service';
import { CreateRoutePointDto } from '../dto/create-route.dto';
import { RoutePoint } from '../entities/route-point.entity';

@Controller('routes/:routeId/points')
export class RoutePointsController {
  constructor(private readonly routePointsService: RoutePointsService) {}

  // POST /routes/:routeId/points
  @Post()
  async create(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Body() createRoutePointDto: CreateRoutePointDto,
  ): Promise<RoutePoint> {
    return await this.routePointsService.create(routeId, createRoutePointDto);
  }

  // GET /routes/:routeId/points
  @Get()
  async findByRoute(@Param('routeId', ParseIntPipe) routeId: number): Promise<RoutePoint[]> {
    return await this.routePointsService.findByRoute(routeId);
  }

  // DELETE /routes/:routeId/points/:id
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return await this.routePointsService.remove(id);
  }
}