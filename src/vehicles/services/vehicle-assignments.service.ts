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
import { calculateEstimatedStops } from '../utils/schedule-estimation.util';
import { formatDateToString } from '../utils/date.util';
import {
    Payment,
    PaymentStatus,
} from 'src/payments/entities/payment.entity';
import { mapAssignmentResponse } from '../utils/response-map';

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
        private readonly stopIntervalRepository: Repository<StopInterval>,

        @InjectRepository(Payment)
        private readonly paymentRepository:
            Repository<Payment>,

    ) { }

    async create(
        createDto: CreateVehicleAssignmentDto,
    ): Promise<VehicleAssignment> {
        await this.validateAssignmentRelations(createDto);

        const assignment = this.assignmentRepository.create({
            ...createDto,
            assignmentDate: new Date(createDto.assignmentDate),
        });

        return this.assignmentRepository.save(assignment);
    }

    async createBulk(
        createDtos: CreateVehicleAssignmentDto[],
    ): Promise<VehicleAssignment[]> {
        const assignments: VehicleAssignment[] = [];

        for (const [index, createDto] of createDtos.entries()) {
            await this.validateAssignmentRelations(
                createDto,
                `Data ke-${index + 1}:`,
            );

            assignments.push(
                this.assignmentRepository.create({
                    ...createDto,
                    assignmentDate: new Date(createDto.assignmentDate),
                }),
            );
        }

        return this.assignmentRepository.save(assignments);
    }

    private async validateAssignmentRelations(
        dto: CreateVehicleAssignmentDto,
        prefix = '',
    ) {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id: dto.vehicleId },
        });
        if (!vehicle)
            throw new NotFoundException(`${prefix} Kendaraan dengan ID ${dto.vehicleId} tidak ditemukan.`,);

        const driver = await this.driverRepository.findOne({
            where: { id: dto.driverId },
        });
        if (!driver)
            throw new NotFoundException(`${prefix} Pengemudi dengan ID ${dto.driverId} tidak ditemukan.`,);

        if (dto.conductorId) {
            const conductor = await this.conductorRepository.findOne({
                where: { id: dto.conductorId },
            });
            if (!conductor)
                throw new NotFoundException(`${prefix} Kondektur dengan ID ${dto.conductorId} tidak ditemukan.`,);
        }

        const route = await this.routeRepository.findOne({
            where: { id: dto.routeId },
        });
        if (!route)
            throw new NotFoundException(
                `${prefix} Trayek dengan ID ${dto.routeId} tidak ditemukan.`,
            );
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
        const assignments = await this.assignmentRepository.find({
            where: {
                assignmentDate: new Date(targetDate) as any,
            },
            relations: {
                route: true,
                driver: true,
                vehicle: true,
                conductor: true,
            },
        });

        if (!assignments || assignments.length === 0) {
            throw new NotFoundException(`Tidak ada jadwal penugasan kendaraan pada tanggal ${targetDate}`);
        }

        const result = await Promise.all(
            assignments.map(async (assignment) => {
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
                    targetDate,
                    assignment.startTime,
                    stops,
                    intervals,
                    10, // Buffer time 10 menit
                );

                return mapAssignmentResponse(assignment, estimatedStops);
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

        return assignments.map((assignment) => mapAssignmentResponse(assignment));
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

        return mapAssignmentResponse(assignment, estimatedStops);
    }

    async getAllTripHistory(
        employeeId: number | string,
        type: 'driver' | 'conductor',
    ) {
        const id = Number(employeeId);

        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException(
                `${type === 'driver' ? 'Driver' : 'Conductor'} ID tidak valid`,
            );
        }

        const where = type === 'driver'
            ? { driverId: id }
            : { conductorId: id };

        const assignments = await this.assignmentRepository.find({
            where,
            relations: {
                route: true,
                driver: true,
                conductor: true,
                vehicle: true,
            },
            order: {
                assignmentDate: 'DESC',
                startTime: 'DESC',
            },
        });

        if (!assignments.length) {
            throw new NotFoundException(
                `Tidak ada riwayat penugasan trip untuk ${type === 'driver' ? 'driver' : 'kondektur'} dengan ID: ${id}`,
            );
        }

        const assignmentIds = assignments.map((assignment) => assignment.id);

        const paymentTotalMap = await this.getPaymentTotalsMap(assignmentIds);

        return assignments.map((assignment) => {
            const totalAmount = paymentTotalMap.get(assignment.id) ?? 0;
            return mapAssignmentResponse(assignment, undefined, totalAmount);
        });
    }

    async getEmployeeTotalIncome(
        employeeId: number | string,
        role: 'driver' | 'conductor',
    ) {
        const id = Number(employeeId);

        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException(
                `${role === 'driver' ? 'Driver' : 'Conductor'} ID tidak valid`,
            );
        }

        const column =
            role === 'driver'
                ? 'assignment.driver_id'
                : 'assignment.conductor_id';

        const result = await this.paymentRepository
            .createQueryBuilder('payment')
            .innerJoin(
                VehicleAssignment,
                'assignment',
                'assignment.id = payment.vehicle_assignment_id',
            )
            .select(
                'COALESCE(SUM(payment.amount), 0)',
                'totalAmount',
            )
            .addSelect(
                'COUNT(payment.id)',
                'totalTransactions',
            )
            .where(`${column} = :employeeId`, {
                employeeId: id,
            })
            .andWhere(
                'payment.status = :status',
                {
                    status: PaymentStatus.PAID,
                },
            )
            .getRawOne();

        return {
            [`${role}Id`]: id,
            totalAmount: Number(
                result?.totalAmount ?? 0,
            ),
            totalTransactions: Number(
                result?.totalTransactions ?? 0,
            ),
        };
    }

    private async getPaymentTotalsMap(assignmentIds: number[]): Promise<Map<number, number>> {
        const paymentTotals = await this.paymentRepository
            .createQueryBuilder('payment')
            .select(
                'payment.vehicle_assignment_id',
                'vehicleAssignmentId',
            )
            .addSelect(
                'COALESCE(SUM(payment.amount), 0)',
                'totalAmount',
            )
            .where(
                'payment.vehicle_assignment_id IN (:...assignmentIds)',
                { assignmentIds },
            )
            .andWhere(
                'payment.status = :status',
                { status: PaymentStatus.PAID },
            )
            .groupBy('payment.vehicle_assignment_id')
            .getRawMany();

        const paymentTotalMap = new Map<number, number>();

        paymentTotals.forEach((payment) => {
            paymentTotalMap.set(
                Number(payment.vehicleAssignmentId),
                Number(payment.totalAmount),
            );
        });

        return paymentTotalMap;
    }
}