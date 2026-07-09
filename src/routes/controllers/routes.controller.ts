import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { RoutesService } from '../services/routes.service';
import { CreateRouteDto } from '../dto/create-route.dto';
import { Route } from '../entities/route.entity';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  async create(@Body() createRouteDto: CreateRouteDto): Promise<Route> {
    return await this.routesService.create(createRouteDto);
  }

  @Get()
  async findAll(): Promise<Route[]> {
    return await this.routesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Route> {
    return await this.routesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateRouteDto: any, // sementara di-set any atau sesuaikan dengan UpdateRouteDto bawaan CLI
  ) {
    return this.routesService.update(id, updateRouteDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return await this.routesService.remove(id);
  }
}
