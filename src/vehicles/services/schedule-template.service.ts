import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignmentStatus } from '../enum/vehicle.enum';
import { VehicleAssignment } from '../entities/vehicle-assignment.entity';
import { CreateScheduleTemplateDto } from '../dto/create/create-schedule-template.dto';
import { UpdateScheduleTemplateDto } from '../dto/update/update-schedule-template.dto';
import { ScheduleTemplate } from '../entities/schedule-template.entity';
import { VehicleLocation } from '../entities/vehicle-location.entity';

@Injectable()
export class ScheduleTemplateService {
    constructor(
        @InjectRepository(ScheduleTemplate)
        private readonly templateRepository: Repository<ScheduleTemplate>,
        @InjectRepository(VehicleAssignment)
        private readonly assignmentRepository: Repository<VehicleAssignment>,
        @InjectRepository(VehicleLocation)
        private readonly locationRepository: Repository<VehicleLocation>,
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
    async findAll() {
        const templates = await this.templateRepository.find({
            relations: {
                route: true,
                vehicle: true,
                driver: true,
                conductor: true,
                mockLiveLocation: true,
            },
        });

        return templates.map((template) => ({
            id: template.id,

            routeId: template.routeId,
            route: template.route
                ? {
                    id: template.route.id,
                    routeCode: template.route.routeCode,
                    routeName: template.route.routeName,
                }
                : null,

            vehicleId: template.vehicleId,
            vehicle: template.vehicle
                ? {
                    id: template.vehicle.id,
                    vehicleCode: template.vehicle.vehicleCode,
                    plateNumber: template.vehicle.plateNumber,
                    type: template.vehicle.type,
                }
                : null,

            driverId: template.driverId,
            driver: template.driver
                ? {
                    id: template.driver.id,
                    name: template.driver.name,
                }
                : null,

            conductorId: template.conductorId,
            conductor: template.conductor
                ? {
                    id: template.conductor.id,
                    name: template.conductor.name,
                }
                : null,

            startTime: template.startTime,
            endTime: template.endTime,
            direction: template.direction,

            activeDays: template.activeDays?.map(Number) ?? [],

            isActive: template.isActive,
            status: template.status,

            mockLiveLocationId: template.mockLiveLocationId,
            mockLiveLocation: template.mockLiveLocation
                ? {
                    id: template.mockLiveLocation.id,
                    name: template.mockLiveLocation.name,
                }
                : null,
        }));
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

    /**
     * Aktifkan semua schedule template yang isActive=true:
     * buat 7 VehicleAssignment per template (hari ini + 6 hari ke depan)
     * dan seed VehicleLocation dari koordinat mockLiveLocation (jika ada).
     */
    async activateScheduleTemplate(): Promise<{
        totalTemplatesProcessed: number;
        assignments: VehicleAssignment[];
        totalLocationsInserted: number;
    }> {
        // 1. Ambil semua template aktif beserta relasi mockLiveLocation
        const activeTemplates = await this.templateRepository.find({
            where: { isActive: true },
            relations: { mockLiveLocation: true },
        });

        const allAssignments: VehicleAssignment[] = [];
        let totalLocationsInserted = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Loop setiap template aktif
        for (const template of activeTemplates) {
            const coordinates = template.mockLiveLocation?.coordinates ?? []; // [lng, lat][]

            // 3. Loop 7 hari: hari ini + 6 hari ke depan
            for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
                const assignmentDate = new Date(today);
                assignmentDate.setDate(today.getDate() + dayOffset);

                // 4. Buat VehicleAssignment untuk tanggal tersebut
                const assignment = this.assignmentRepository.create({
                    routeId: template.routeId,
                    vehicleId: template.vehicleId,
                    driverId: template.driverId,
                    conductorId: template.conductorId,
                    direction: template.direction,
                    assignmentDate: assignmentDate,
                    startTime: template.startTime,
                    endTime: template.endTime,
                    status: template.status,
                    currentPassengers: 10,
                });

                const savedAssignment = await this.assignmentRepository.save(assignment);
                allAssignments.push(savedAssignment);

                // 5. Bulk-insert koordinat dari mockLiveLocation sebagai VehicleLocation (jika ada)
                if (coordinates.length > 0) {
                    const locationEntities = coordinates.map(([lng, lat]) =>
                        this.locationRepository.create({
                            vehicleAssignmentId: savedAssignment.id,
                            longitude: lng,
                            latitude: lat,
                        }),
                    );

                    await this.locationRepository.save(locationEntities);
                    totalLocationsInserted += locationEntities.length;
                }
            }
        }

        return {
            totalTemplatesProcessed: activeTemplates.length,
            assignments: allAssignments,
            totalLocationsInserted,
        };
    }
}