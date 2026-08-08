import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import { CreateVehicleLocationDto } from '../dto/create/create-vehicle-location.dto';
import { VehicleLocation } from '../entities/vehicle-location.entity';
import { UpdateVehicleLocationDto } from '../dto/update/update-vehicle-location.dto';
import { RouteStop } from 'src/routes/entities/route-stop.entity';
import { StopStatus } from '../enum/vehicle.enum';

@Injectable()
export class VehicleLocationsService {
    constructor(
        @InjectRepository(VehicleLocation)
        private readonly locationRepository: Repository<VehicleLocation>,
        @InjectRepository(VehicleAssignment)
        private readonly assignmentRepository: Repository<VehicleAssignment>,
        @InjectRepository(RouteStop)
        private readonly routeStopRepository: Repository<RouteStop>,
    ) { }

    async create(createDto: CreateVehicleLocationDto): Promise<VehicleLocation> {
        const assignment = await this.assignmentRepository.findOne({
            where: { id: createDto.vehicleAssignmentId },
        });

        if (!assignment) {
            throw new NotFoundException(`Penugasan kendaraan dengan ID ${createDto.vehicleAssignmentId} tidak ditemukan.`);
        }

        if (createDto.currentStopId) {
            const stop = await this.routeStopRepository.findOne({
                where: { id: createDto.currentStopId },
            });

            if (!stop) {
                throw new NotFoundException(`Halte dengan ID ${createDto.currentStopId} tidak ditemukan.`);
            }
        }

        const location = this.locationRepository.create(createDto);
        return await this.locationRepository.save(location);
    }

    async findLatestByAssignmentId(assignmentId: number): Promise<VehicleLocation> {
        const latestLocation = await this.locationRepository.findOne({
            where: { vehicleAssignmentId: assignmentId },
            relations: { vehicleAssignment: true },
            order: { createdAt: 'DESC' },
        });

        if (!latestLocation) {
            throw new NotFoundException(`Data lokasi terbaru untuk penugasan ID ${assignmentId} tidak ditemukan.`);
        }

        return latestLocation;
    }

    private async getInitialStops(assignmentId: number) {
        const assignment = await this.assignmentRepository.findOne({
            where: { id: assignmentId },
            relations: { route: true },
        });

        if (!assignment) {
            throw new NotFoundException(`Penugasan kendaraan dengan ID ${assignmentId} tidak ditemukan.`);
        }

        const routeId = assignment.routeId || assignment.route?.id;

        if (!routeId) {
            throw new NotFoundException(`Rute untuk penugasan kendaraan dengan ID ${assignmentId} tidak ditemukan.`);
        }

        const initialStops = await this.routeStopRepository.find({
            where: { routeId },
            order: { stopOrder: 'ASC' },
            take: 2,
        });

        return initialStops.map(stop => ({
            id: stop.id,
            latitude: stop.latitude,
            longitude: stop.longitude,
        }));
    }

    async startSession(assignmentId: number): Promise<VehicleLocation> {
        const existingLocation = await this.locationRepository.findOne({
            where: { vehicleAssignmentId: assignmentId },
            order: { createdAt: 'DESC' },
        });

        if (existingLocation) {
            return existingLocation;
        }

        const stops = await this.getInitialStops(assignmentId);

        if (stops.length === 0) {
            throw new NotFoundException(`Tidak ada halte yang ditemukan untuk penugasan ID ${assignmentId}.`);
        }

        const firstStop = stops[0];

        const createLocationDto: CreateVehicleLocationDto = {
            vehicleAssignmentId: assignmentId,
            latitude: firstStop.latitude,
            longitude: firstStop.longitude,
            currentStopId: firstStop.id,
            stopStatus: StopStatus.AT_STOP,
        };

        return await this.create(createLocationDto);
    }

    async findAll(vehicleAssignmentId?: number): Promise<VehicleLocation[]> {
        const whereCondition = vehicleAssignmentId ? { vehicleAssignmentId } : {};
        return await this.locationRepository.find({
            where: whereCondition,
            relations: { vehicleAssignment: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<VehicleLocation> {
        const location = await this.locationRepository.findOne({
            where: { id },
            relations: { vehicleAssignment: true },
        });

        if (!location) {
            throw new NotFoundException(`Data lokasi dengan ID ${id} tidak ditemukan.`);
        }

        return location;
    }
    async update(id: number, updateDto: UpdateVehicleLocationDto): Promise<VehicleLocation> {
        // 1. Cari data location berdasarkan ID (asumsi Anda sudah punya method findOne(id))
        const location = await this.findOne(id);

        // 2. Jika ada perubahan vehicleAssignmentId, validasi dulu keberadaannya
        if (updateDto.vehicleAssignmentId && updateDto.vehicleAssignmentId !== location.vehicleAssignmentId) {
            const assignment = await this.assignmentRepository.findOne({
                where: { id: updateDto.vehicleAssignmentId },
            });
            if (!assignment) {
                throw new NotFoundException(`Penugasan kendaraan dengan ID ${updateDto.vehicleAssignmentId} tidak ditemukan.`);
            }
        }

        // 3. Validasi currentStopId jika disertakan dalam update
        if (updateDto.currentStopId !== undefined) {
            if (updateDto.currentStopId === null) {
                location.currentStopId = undefined;
            } else {
                const stop = await this.routeStopRepository.findOne({
                    where: { id: updateDto.currentStopId },
                });
                if (!stop) {
                    throw new NotFoundException(`Halte dengan ID ${updateDto.currentStopId} tidak ditemukan.`);
                }
            }
        }

        // 4. Timpa data lama dengan data baru dari DTO
        Object.assign(location, updateDto);

        // 5. Simpan perubahan ke database
        return await this.locationRepository.save(location);
    }

    async remove(id: number): Promise<{ message: string }> {
        const location = await this.findOne(id);
        await this.locationRepository.remove(location);
        return { message: `Data lokasi dengan ID ${id} berhasil dihapus.` };
    }
}