import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleServiceDto } from '../dto/create/create-vehicle-service.dto';
import { UpdateVehicleServiceDto } from '../dto/update/update-vehicle-service.dto';
import { VehicleService } from '../entities/vehicle-service.entity';
import { Vehicle } from '../entities/vehicle.entity';

@Injectable()
export class VehicleServicesService {
    constructor(
        @InjectRepository(VehicleService)
        private readonly vehicleServiceRepository: Repository<VehicleService>,
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
    ) { }

    async create(createDto: CreateVehicleServiceDto): Promise<VehicleService> {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id: createDto.vehicleId },
        });

        if (!vehicle) {
            throw new NotFoundException(`Kendaraan dengan ID ${createDto.vehicleId} tidak ditemukan.`);
        }

        const serviceRecord = this.vehicleServiceRepository.create({
            ...createDto,
            serviceDate: new Date(createDto.serviceDate),
            nextServiceDate: createDto.nextServiceDate ? new Date(createDto.nextServiceDate) : undefined,
        });

        const savedService = await this.vehicleServiceRepository.save(serviceRecord);

        if (createDto.odometerAtService > vehicle.currentOdometer) {
            vehicle.currentOdometer = createDto.odometerAtService;
            await this.vehicleRepository.save(vehicle);
        }

        return savedService;
    }

    async findAll(vehicleId?: number): Promise<VehicleService[]> {
        const whereCondition = vehicleId ? { vehicleId } : {};
        return await this.vehicleServiceRepository.find({
            where: whereCondition,
            relations: {
                vehicle: true,
            },
            order: { serviceDate: 'DESC' },
        });
    }

    async findOne(id: number): Promise<VehicleService> {
        const serviceRecord = await this.vehicleServiceRepository.findOne({
            where: { id },
            relations: {
                vehicle: true,
            },
        });

        if (!serviceRecord) {
            throw new NotFoundException(`Data servis dengan ID ${id} tidak ditemukan.`);
        }

        return serviceRecord;
    }

    async findByVehicleId(vehicleId: number): Promise<VehicleService[]> {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id: vehicleId },
        });

        if (!vehicle) {
            throw new NotFoundException(
                `Kendaraan dengan ID ${vehicleId} tidak ditemukan.`,
            );
        }

        return await this.vehicleServiceRepository.find({
            where: { vehicleId },
            relations: {
                vehicle: true,
            },
            order: {
                serviceDate: 'DESC',
            },
        });
    }

    async update(id: number, updateDto: UpdateVehicleServiceDto): Promise<VehicleService> {
        const serviceRecord = await this.findOne(id);

        // Jika vehicleId di-update, pastikan kendaraan barunya ada
        if (updateDto.vehicleId && updateDto.vehicleId !== serviceRecord.vehicleId) {
            const vehicleExists = await this.vehicleRepository.findOne({
                where: { id: updateDto.vehicleId },
            });
            if (!vehicleExists) {
                throw new NotFoundException(`Kendaraan baru dengan ID ${updateDto.vehicleId} tidak ditemukan.`);
            }
        }

        Object.assign(serviceRecord, {
            ...updateDto,
            serviceDate: updateDto.serviceDate ? new Date(updateDto.serviceDate) : serviceRecord.serviceDate,
            nextServiceDate: updateDto.nextServiceDate ? new Date(updateDto.nextServiceDate) : serviceRecord.nextServiceDate,
        });

        return await this.vehicleServiceRepository.save(serviceRecord);
    }

    async remove(id: number): Promise<{ message: string }> {
        const serviceRecord = await this.findOne(id);
        await this.vehicleServiceRepository.remove(serviceRecord);
        return { message: `Data servis dengan ID ${id} berhasil dihapus.` };
    }
}