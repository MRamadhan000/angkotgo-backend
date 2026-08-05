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
import { CreateRoutePathDto } from '../dto/create/create-route-path.dto';
import { UpdateRoutePathDto } from '../dto/update/update-route-path.dto';
import { RoutePath } from '../entities/route-path.entity';
import { RoutePathsService } from '../services/route-paths.service';

@Controller('route-paths')
export class RoutePathsController {
    constructor(private readonly routePathsService: RoutePathsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createRoutePathDto: CreateRoutePathDto): Promise<{ message: string; data: RoutePath }> {
        const data = await this.routePathsService.create(createRoutePathDto);
        return {
            message: 'Titik koordinat jalur berhasil ditambahkan.',
            data,
        };
    }

    @Post('bulk')
    async createBulk(@Body() createRoutePathsDto: CreateRoutePathDto[]) {
        const paths = await this.routePathsService.createBulk(createRoutePathsDto);
        return {
            message: 'Multiple route paths successfully created',
            data: paths,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findByRouteAndDirection(
        @Query('routeId', ParseIntPipe) routeId: number,
        @Query('direction') direction: string,
    ): Promise<{ message: string; data: RoutePath[] }> {
        const data = await this.routePathsService.findByRouteAndDirection(routeId, direction);
        return {
            message: `Berhasil mengambil daftar koordinat jalur untuk trayek ID ${routeId} (${direction}).`,
            data,
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoutePathDto: UpdateRoutePathDto
    ): Promise<{ message: string; data: RoutePath }> {
        const data = await this.routePathsService.update(id, updateRoutePathDto);
        return {
            message: `Titik koordinat jalur dengan ID ${id} berhasil diperbarui.`,
            data,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        return await this.routePathsService.remove(id);
    }

    @Delete('bulk/clear')
    @HttpCode(HttpStatus.OK)
    async removeByRouteAndDirection(
        @Query('routeId', ParseIntPipe) routeId: number,
        @Query('direction') direction: string,
    ): Promise<{ message: string }> {
        return await this.routePathsService.removeByRouteAndDirection(routeId, direction);
    }
}