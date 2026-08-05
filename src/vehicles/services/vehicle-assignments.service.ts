import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Conductor } from 'src/conductors/entities/conductor.entity'; // <-- Pastikan di-import
import { Route } from 'src/routes/entities/route.entity';
import { Repository } from 'typeorm';
import { CreateVehicleAssignmentDto } from '../dto/create/create-vehicle-assignment.dto';
import { UpdateVehicleAssignmentDto } from '../dto/update/update-vehicle-assignment.dto';
import { VehicleAssignment } from '../entities/vehicle-assignment.entity';
import { Vehicle } from '../entities/vehicle.entity';

@Injectable()
export class VehicleAssignmentsService {
    constructor(
        @InjectRepository(VehicleAssignment)
        private readonly assignmentRepository: Repository<VehicleAssignment>,
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>,
        @InjectRepository(Conductor)
        private readonly conductorRepository: Repository<Conductor>,
        @InjectRepository(Route)
        private readonly routeRepository: Repository<Route>,
    ) { }

    async create(createDto: CreateVehicleAssignmentDto): Promise<VehicleAssignment> {
        const vehicle = await this.vehicleRepository.findOne({ where: { id: createDto.vehicleId } });
        if (!vehicle) {
            throw new NotFoundException(`Kendaraan dengan ID ${createDto.vehicleId} tidak ditemukan.`);
        }

        const driver = await this.driverRepository.findOne({ where: { id: createDto.driverId } });
        if (!driver) {
            throw new NotFoundException(`Pengemudi dengan ID ${createDto.driverId} tidak ditemukan.`);
        }

        if (createDto.conductorId) {
            const conductor = await this.conductorRepository.findOne({ where: { id: createDto.conductorId } });
            if (!conductor) {
                throw new NotFoundException(`Kondektur dengan ID ${createDto.conductorId} tidak ditemukan.`);
            }
        }

        const route = await this.routeRepository.findOne({ where: { id: createDto.routeId } });
        if (!route) {
            throw new NotFoundException(`Trayek dengan ID ${createDto.routeId} tidak ditemukan.`);
        }

        const assignment = this.assignmentRepository.create({
            ...createDto,
            assignmentDate: new Date(createDto.assignmentDate),
        });

        return await this.assignmentRepository.save(assignment);
    }

    async createBulk(createDtos: CreateVehicleAssignmentDto[]): Promise<VehicleAssignment[]> {
        const assignmentsToCreate: VehicleAssignment[] = [];

        for (const [index, createDto] of createDtos.entries()) {
            const prefix = `Data ke-${index + 1}:`;

            const vehicle = await this.vehicleRepository.findOne({ where: { id: createDto.vehicleId } });
            if (!vehicle) {
                throw new NotFoundException(`${prefix} Kendaraan dengan ID ${createDto.vehicleId} tidak ditemukan.`);
            }

            const driver = await this.driverRepository.findOne({ where: { id: createDto.driverId } });
            if (!driver) {
                throw new NotFoundException(`${prefix} Pengemudi dengan ID ${createDto.driverId} tidak ditemukan.`);
            }

            if (createDto.conductorId) {
                const conductor = await this.conductorRepository.findOne({ where: { id: createDto.conductorId } });
                if (!conductor) {
                    throw new NotFoundException(`${prefix} Kondektur dengan ID ${createDto.conductorId} tidak ditemukan.`);
                }
            }

            const route = await this.routeRepository.findOne({ where: { id: createDto.routeId } });
            if (!route) {
                throw new NotFoundException(`${prefix} Trayek dengan ID ${createDto.routeId} tidak ditemukan.`);
            }

            const assignment = this.assignmentRepository.create({
                ...createDto,
                assignmentDate: new Date(createDto.assignmentDate),
            });

            assignmentsToCreate.push(assignment);
        }

        return await this.assignmentRepository.save(assignmentsToCreate);
    }

    async findAll(vehicleId?: number, assignmentDate?: string): Promise<VehicleAssignment[]> {
        const whereCondition: any = {};
        if (vehicleId) whereCondition.vehicleId = vehicleId;
        if (assignmentDate) whereCondition.assignmentDate = new Date(assignmentDate);

        return await this.assignmentRepository.find({
            where: whereCondition,
            relations: {
                vehicle: true,
                driver: true,
                route: true,
            },
            order: { assignmentDate: 'DESC', startTime: 'ASC' },
        });
    }

    async findOne(id: number): Promise<VehicleAssignment> {
        const assignment = await this.assignmentRepository.findOne({
            where: { id },
            relations: {
                vehicle: true,
                driver: true,
                route: true,
            },
        });

        if (!assignment) {
            throw new NotFoundException(`Penugasan dengan ID ${id} tidak ditemukan.`);
        }

        return assignment;
    }

    async update(id: number, updateDto: UpdateVehicleAssignmentDto): Promise<VehicleAssignment> {
        const assignment = await this.findOne(id);

        if (updateDto.vehicleId && updateDto.vehicleId !== assignment.vehicleId) {
            const v = await this.vehicleRepository.findOne({ where: { id: updateDto.vehicleId } });
            if (!v) throw new NotFoundException(`Kendaraan baru dengan ID ${updateDto.vehicleId} tidak ditemukan.`);
        }
        if (updateDto.driverId && updateDto.driverId !== assignment.driverId) {
            const d = await this.driverRepository.findOne({ where: { id: updateDto.driverId } });
            if (!d) throw new NotFoundException(`Pengemudi baru dengan ID ${updateDto.driverId} tidak ditemukan.`);
        }
        if (updateDto.routeId && updateDto.routeId !== assignment.routeId) {
            const r = await this.routeRepository.findOne({ where: { id: updateDto.routeId } });
            if (!r) throw new NotFoundException(`Trayek baru dengan ID ${updateDto.routeId} tidak ditemukan.`);
        }

        Object.assign(assignment, {
            ...updateDto,
            assignmentDate: updateDto.assignmentDate ? new Date(updateDto.assignmentDate) : assignment.assignmentDate,
        });

        return await this.assignmentRepository.save(assignment);
    }

    async remove(id: number): Promise<{ message: string }> {
        const assignment = await this.findOne(id);
        await this.assignmentRepository.remove(assignment);
        return { message: `Penugasan dengan ID ${id} berhasil dihapus.` };
    }
}