import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ScheduleTemplateService } from '../services/schedule-template.service';
import { CreateScheduleTemplateDto } from '../dto/create/create-schedule-template.dto';
import { UpdateScheduleTemplateDto } from '../dto/update/update-schedule-template.dto';

@Controller('schedule-templates')
export class ScheduleTemplateController {
    constructor(
        private readonly scheduleTemplateService: ScheduleTemplateService,
    ) { }

    @Post()
    async create(@Body() dto: CreateScheduleTemplateDto) {
        const data = await this.scheduleTemplateService.create(dto);
        return { message: 'Schedule template berhasil dibuat.', data };
    }

    @Post('bulk')
    async createBulk(
        @Body() dtos: CreateScheduleTemplateDto[],
    ) {
        if (!dtos.length) {
            throw new BadRequestException(
                'Minimal satu schedule template harus dikirim.',
            );
        }

        const data =
            await this.scheduleTemplateService.createBulk(dtos);

        return {
            message: `Berhasil membuat ${data.length} schedule template.`,
            data,
        };
    }

    @Get()
    async findAll() {
        const data = await this.scheduleTemplateService.findAll();
        return { message: 'Berhasil mengambil data schedule template.', data };
    }

    @Post('generate')
    async generateAssignments(@Query('date') date: string) {
        if (!date) {
            throw new BadRequestException(
                'Query parameter "date" (YYYY-MM-DD) wajib diisi.',
            );
        }

        const data =
            await this.scheduleTemplateService.generateAssignmentsForDate(date);

        return {
            message: `Berhasil generate jadwal untuk tanggal ${date}.`,
            data,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.scheduleTemplateService.findOne(+id);
        return { message: 'Berhasil mengambil data schedule template.', data };
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateScheduleTemplateDto,
    ) {
        const data = await this.scheduleTemplateService.update(+id, dto);
        return { message: 'Schedule template berhasil diperbarui.', data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.scheduleTemplateService.remove(+id);
        return { message: 'Schedule template berhasil dihapus.', data: null };
    }
}