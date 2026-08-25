import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Conductor } from 'src/conductors/entities/conductor.entity'; // <-- Pastikan di-import
import { Route } from 'src/routes/entities/route.entity';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateVehicleAssignmentDto } from '../dto/create/create-vehicle-assignment.dto';
import { UpdateVehicleAssignmentDto } from '../dto/update/update-vehicle-assignment.dto';
import { VehicleAssignment } from '../entities/vehicle-assignment.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { RouteStop } from 'src/routes/entities/route-stop.entity';
import { StopInterval } from 'src/routes/entities/stop-interval.entity';
import { AssignmentStatus } from '../enum/vehicle.enum';
import { calculateEstimatedStops } from '../utils/schedule-estimation.util';
import { formatDateToString } from '../utils/date.util';

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
        @InjectRepository(RouteStop)
        private readonly routeStopRepository: Repository<RouteStop>,
        @InjectRepository(StopInterval)
        private readonly stopIntervalRepository: Repository<StopInterval>,) { }

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
                conductor: true,
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

    async getAllDriversScheduleWithEstimatedArrival(targetDate: string) {
        // 1. Ambil semua assignment driver berdasarkan tanggal tertentu
        const assignments = await this.assignmentRepository.find({
            where: {
                assignmentDate: new Date(targetDate) as any,
            },
            relations: {
                route: true,
                driver: true,
                vehicle: true,
            },
        });

        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`Tidak ada jadwal penugasan kendaraan pada tanggal ${targetDate}`);
        }

        // 2. Proses tiap assignment menggunakan mapping secara paralel
        const result = await Promise.all(
            assignments.map(async (assignment) => {
                // Ambil halte untuk rute & arah penugasan ini
                const stops = await this.routeStopRepository.find({
                    where: {
                        routeId: assignment.routeId,
                        direction: assignment.direction,
                    },
                    order: { stopOrder: 'ASC' },
                });

                // Ambil data interval antar halte
                const intervals = await this.stopIntervalRepository.find({
                    where: {
                        routeId: assignment.routeId,
                        direction: assignment.direction,
                    },
                });

                const estimatedStops = calculateEstimatedStops(
                    targetDate,
                    assignment.startTime,
                    stops,
                    intervals,
                    10, // Buffer time 10 menit
                );

                // 3. Mapping data dengan field yang dipilih secara spesifik
                return {
                    assignmentId: assignment.id,
                    date: assignment.assignmentDate,
                    driver: {
                        id: assignment.driver?.id,
                        name: assignment.driver?.name, // Sesuaikan properti nama di entity Driver Anda jika berbeda (misal: fullName)
                    },
                    routeCode: assignment.route?.routeCode,
                    routeName: assignment.route?.routeName,
                    direction: assignment.direction,
                    startTime: assignment.startTime,
                    endTime: assignment.endTime,
                    vehicle: {
                        id: assignment.vehicle?.id,
                        plateNumber: assignment.vehicle?.plateNumber,
                        vehicleCode: assignment.vehicle?.vehicleCode,
                        capacity: assignment.vehicle?.capacity,
                        type: assignment.vehicle?.type,
                    },
                    estimatedStopsSchedule: estimatedStops,
                    currentPassangers : assignment.currentPassengers
                };
            }),
        );

        return result;

    }

    async getActiveScheduleByPersonnel(params: {
        targetDate?: string;
        driverId?: number;
        conductorId?: number;
    }) {
        const { targetDate, driverId, conductorId } = params;

        const whereCondition: FindOptionsWhere<VehicleAssignment> = {
            status: In(['SCHEDULED', 'ONGOING']),
        };

        if (targetDate) {
            whereCondition.assignmentDate = new Date(targetDate) as any;
        }

        if (driverId) whereCondition.driverId = driverId;
        if (conductorId) whereCondition.conductorId = conductorId;

        const assignments = await this.assignmentRepository.find({
            where: whereCondition,
            relations: {
                route: true,
                driver: true,
                vehicle: true,
                conductor: true,
            },
            order: { startTime: 'ASC' },
        });

        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`Tidak ada jadwal penugasan yang aktif.`);
        }

        const result = assignments.map((assignment) => {
            return {
                assignmentId: assignment.id,
                date: assignment.assignmentDate,
                status: assignment.status,
                direction: assignment.direction,
                startTime: assignment.startTime,
                endTime: assignment.endTime,
                driver: {
                    id: assignment.driver?.id,
                    name: assignment.driver?.name,
                },
                conductor: {
                    id: assignment.conductor?.id,
                    name: assignment.conductor?.name,
                },
                routeCode: assignment.route?.routeCode,
                routeName: assignment.route?.routeName,
                vehicle: {
                    id: assignment.vehicle?.id,
                    plateNumber: assignment.vehicle?.plateNumber,
                    vehicleCode: assignment.vehicle?.vehicleCode,
                    capacity: assignment.vehicle?.capacity,
                    type: assignment.vehicle?.type,
                },
                currentPassanger : assignment.currentPassengers
            };
        });

        return result;
    }

    async getVehicleAssignmentById(assignmentId: number) {
        const assignment = await this.assignmentRepository.findOne({
            where: {
                id: assignmentId,
            },
            relations: {
                route: true,
                driver: true,
                vehicle: true,
                conductor: true,
            },
        });

        if (!assignment) {
            throw new NotFoundException(`Data penugasan kendaraan dengan ID ${assignmentId} tidak ditemukan`);
        }

        const assignmentDateStr = formatDateToString(assignment.assignmentDate);

        const stops = await this.routeStopRepository.find({
            where: {
                routeId: assignment.routeId,
                direction: assignment.direction,
            },
            order: { stopOrder: 'ASC' },
        });

        const intervals = await this.stopIntervalRepository.find({
            where: {
                routeId: assignment.routeId,
                direction: assignment.direction,
            },
        });

        const estimatedStops = calculateEstimatedStops(
            assignmentDateStr,
            assignment.startTime,
            stops,
            intervals,
            10, // Buffer time 10 menit
        );

        return {
            assignmentId: assignment.id,
            date: assignment.assignmentDate,
            status: assignment.status,
            direction: assignment.direction,
            startTime: assignment.startTime,
            endTime: assignment.endTime,
            driver: {
                id: assignment.driver?.id,
                name: assignment.driver?.name,
            },
            conductor: {
                id: assignment.conductor?.id,
                name: assignment.conductor?.name,
            },
            routeCode: assignment.route?.routeCode,
            routeName: assignment.route?.routeName,
            vehicle: {
                id: assignment.vehicle?.id,
                plateNumber: assignment.vehicle?.plateNumber,
                vehicleCode: assignment.vehicle?.vehicleCode,
                capacity: assignment.vehicle?.capacity,
                type: assignment.vehicle?.type,
            },
            estimatedStopsSchedule: estimatedStops,
            currentPassengers : assignment.currentPassengers
        };
    }

    async getAllDriverTripHistory(driverId: number | string) {
        const assignments = await this.assignmentRepository.find({
            where: {
                driverId: Number(driverId),
            },
            relations: {
                route: true,
                driver: true,
                vehicle: true,
                conductor: true,
            },
            order: {
                assignmentDate: 'DESC',
                startTime: 'DESC',
            },
        });

        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`Tidak ada riwayat penugasan trip untuk driver dengan ID: ${driverId}`);
        }

        const result = await Promise.all(
            assignments.map(async (assignment) => {

                return {
                    assignmentId: assignment.id,
                    date: assignment.assignmentDate,
                    status: assignment.status,
                    driver: {
                        id: assignment.driver?.id,
                        name: assignment.driver?.name,
                    },
                    conductor: {
                        id: assignment.conductor?.id,
                        name: assignment.conductor?.name,
                    },
                    routeCode: assignment.route?.routeCode,
                    routeName: assignment.route?.routeName,
                    direction: assignment.direction,
                    startTime: assignment.startTime,
                    endTime: assignment.endTime,
                    vehicle: {
                        id: assignment.vehicle?.id,
                        plateNumber: assignment.vehicle?.plateNumber,
                        vehicleCode: assignment.vehicle?.vehicleCode,
                        capacity: assignment.vehicle?.capacity,
                        type: assignment.vehicle?.type,
                    },
                };
            }),
        );

        return result;
    }

    async getAllConductorTripHistory(conductorId: number | string) {
        const assignments = await this.assignmentRepository.find({
            where: {
                conductorId: Number(conductorId),
            },
            relations: {
                route: true,
                conductor: true,
                vehicle: true,
                driver: true,
            },
            order: {
                assignmentDate: 'DESC',
                startTime: 'DESC',
            },
        });

        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`Tidak ada riwayat penugasan trip untuk kondektur dengan ID: ${conductorId}`);
        }

        const result = await Promise.all(
            assignments.map(async (assignment) => {
                return {
                    assignmentId: assignment.id,
                    date: assignment.assignmentDate,
                    status: assignment.status,
                    conductor: {
                        id: assignment.conductor?.id,
                        name: assignment.conductor?.name,
                    },
                    driver: {
                        id: assignment.driver?.id,
                        name: assignment.driver?.name,
                    },
                    routeCode: assignment.route?.routeCode,
                    routeName: assignment.route?.routeName,
                    direction: assignment.direction,
                    startTime: assignment.startTime,
                    endTime: assignment.endTime,
                    vehicle: {
                        id: assignment.vehicle?.id,
                        plateNumber: assignment.vehicle?.plateNumber,
                        vehicleCode: assignment.vehicle?.vehicleCode,
                        capacity: assignment.vehicle?.capacity,
                        type: assignment.vehicle?.type,
                    },
                };
            }),
        );
        return result;
    }
}