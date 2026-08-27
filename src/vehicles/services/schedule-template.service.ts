import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignmentStatus } from '../enum/vehicle.enum';
import { VehicleAssignment } from '../entities/vehicle-assignment.entity';
import { CreateScheduleTemplateDto } from '../dto/create/create-schedule-template.dto';
import { UpdateScheduleTemplateDto } from '../dto/update/update-schedule-template.dto';
import { ScheduleTemplate } from '../entities/schedule-template.entity';

@Injectable()
export class ScheduleTemplateService {
    constructor(
        @InjectRepository(ScheduleTemplate)
        private readonly templateRepository: Repository<ScheduleTemplate>,
        @InjectRepository(VehicleAssignment)
        private readonly assignmentRepository: Repository<VehicleAssignment>,
    ) { }

    async create(dto: CreateScheduleTemplateDto): Promise<ScheduleTemplate> {
        return this.templateRepository.save(
            this.templateRepository.create(dto),
        );
    }

    async createBulk(
        dtos: CreateScheduleTemplateDto[],
    ): Promise<ScheduleTemplate[]> {
        const templates = this.templateRepository.create(dtos);

        return this.templateRepository.save(templates);
    }

    async findAll(): Promise<ScheduleTemplate[]> {
        return this.templateRepository.find({
            relations: {
                route: true,
                vehicle: true,
                driver: true,
                conductor: true,
            },
        });
    }

    async findOne(id: number): Promise<ScheduleTemplate> {
        const template = await this.templateRepository.findOne({
            where: { id },
            relations: {
                route: true,
                vehicle: true,
                driver: true,
                conductor: true,
            },
        });

        if (!template) {
            throw new NotFoundException(
                `Schedule template dengan ID ${id} tidak ditemukan`,
            );
        }

        return template;
    }

    async update(
        id: number,
        dto: UpdateScheduleTemplateDto,
    ): Promise<ScheduleTemplate> {
        await this.findOne(id);
        await this.templateRepository.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.templateRepository.remove(await this.findOne(id));
    }

    async generateAssignmentsForDate(
        targetDate: string,
    ): Promise<VehicleAssignment[]> {
        const date = new Date(targetDate);
        const dayOfWeek = date.getDay() || 7;

        const templates = await this.templateRepository.find({
            where: { isActive: true },
        });

        const matchedTemplates = templates.filter(
            ({ activeDays }) =>
                !activeDays?.length || activeDays.includes(dayOfWeek),
        );

        const assignments: VehicleAssignment[] = [];

        for (const template of matchedTemplates) {
            const exists = await this.assignmentRepository.findOne({
                where: {
                    routeId: template.routeId,
                    assignmentDate: date,
                    startTime: template.startTime,
                },
            });

            if (exists) continue;

            const assignment = this.assignmentRepository.create({
                routeId: template.routeId,
                vehicleId: template.vehicleId,
                driverId: template.driverId,
                conductorId: template.conductorId,
                direction: template.direction,
                assignmentDate: date,
                startTime: template.startTime,
                endTime: template.endTime,
                status: AssignmentStatus.SCHEDULED,
                currentPassengers: 0,
            });

            assignments.push(
                await this.assignmentRepository.save(assignment),
            );
        }

        return assignments;
    }
}