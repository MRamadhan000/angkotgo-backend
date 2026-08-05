import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import { CreateVehicleLocationDto } from '../dto/create/create-vehicle-location.dto';
import { VehicleLocation } from '../entities/vehicle-location.entity';
import { UpdateVehicleLocationDto } from '../dto/update/update-vehicle-location.dto';

@Injectable()
export class VehicleLocationsService {
    constructor(
        @InjectRepository(VehicleLocation)
        private readonly locationRepository: Repository<VehicleLocation>,
        @InjectRepository(VehicleAssignment)
        private readonly assignmentRepository: Repository<VehicleAssignment>,
    ) {}

    async create(createDto: CreateVehicleLocationDto): Promise<VehicleLocation> {
        const assignment = await this.assignmentRepository.findOne({
            where: { id: createDto.vehicleAssignmentId },
        });

        if (!assignment) {
            throw new NotFoundException(`Penugasan kendaraan dengan ID ${createDto.vehicleAssignmentId} tidak ditemukan.`);
        }

        const location = this.locationRepository.create(createDto);
        return await this.locationRepository.save(location);
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
        const location = await this.findOne(id);

        // Jika ada perubahan assignmentId, validasi dulu keberadaannya
        if (updateDto.vehicleAssignmentId && updateDto.vehicleAssignmentId !== location.vehicleAssignmentId) {
            const assignment = await this.assignmentRepository.findOne({
                where: { id: updateDto.vehicleAssignmentId },
            });
            if (!assignment) {
                throw new NotFoundException(`Penugasan kendaraan dengan ID ${updateDto.vehicleAssignmentId} tidak ditemukan.`);
            }
        }

        Object.assign(location, updateDto);
        return await this.locationRepository.save(location);
    }

    async remove(id: number): Promise<{ message: string }> {
        const location = await this.findOne(id);
        await this.locationRepository.remove(location);
        return { message: `Data lokasi dengan ID ${id} berhasil dihapus.` };
    }
}