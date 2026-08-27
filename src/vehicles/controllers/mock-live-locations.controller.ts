import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { MockLiveLocationService } from '../services/mock-live-location.service';
import { CreateMockLiveLocationDto } from '../dto/create/create-mock-live-location.dto';
import { UpdateMockLiveLocationDto } from '../dto/update/update-mock-live-location.dto';

@Controller('mock-live-locations')
export class MockLiveLocationController {
    constructor(
        private readonly service: MockLiveLocationService,
    ) { }

    @Post()
    async create(@Body() dto: CreateMockLiveLocationDto) {
        const data = await this.service.create(dto);
        return {
            message: 'Mock live location berhasil dibuat.',
            data,
        };
    }

    @Get()
    async findAll() {
        const data = await this.service.findAll();
        return {
            message: 'Berhasil mengambil mock live locations.',
            data,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.service.findOne(+id);
        return {
            message: 'Berhasil mengambil mock live location.',
            data,
        };
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateMockLiveLocationDto,
    ) {
        const data = await this.service.update(+id, dto);
        return {
            message: 'Mock live location berhasil diperbarui.',
            data,
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.service.remove(+id);
        return {
            message: 'Mock live location berhasil dihapus.',
            data: null,
        };
    }
}