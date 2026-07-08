import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    return await this.vehicleRepository.find();
  }

  async findOne(id: number): Promise<Vehicle> {
    const driver = await this.vehicleRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    try {
      const newVehicle = this.vehicleRepository.create(createVehicleDto);
      return await this.vehicleRepository.save(newVehicle);
    } catch (error: any) {
      // Kode '23505' adalah unik/duplicate error milik PostgreSQL
      if (error.code === '23505') {
        throw new ConflictException(
          'Plat nomor atau Kode lambung kendaraan sudah terdaftar!',
        );
      }
      throw error;
    }
  }

  async update(id: number, input: UpdateVehicleDto): Promise<Vehicle> {
    const driver = await this.vehicleRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    await this.ensureUniqueDriver(input, driver);

    Object.assign(driver, input);

    return await this.vehicleRepository.save(driver);
  }

  // Deactivate Driver by ID
  async deactivate(id: number): Promise<Vehicle> {
    const driver = await this.vehicleRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    driver.status = VehicleStatus.INACTIVE;
    return await this.vehicleRepository.save(driver);
  }

  async ensureUniqueDriver(
    input: UpdateVehicleDto,
    vehicle: Vehicle,
  ): Promise<Vehicle> {
    if (input.vehicleCode && input.vehicleCode !== vehicle.vehicleCode) {
      const exists = await this.vehicleRepository.findOne({
        where: { vehicleCode: input.vehicleCode },
      });

      if (exists) {
        throw new ConflictException('Vehicle Code already exists');
      }
    }

    if (input.plateNumber && input.plateNumber !== vehicle.plateNumber) {
      const exists = await this.vehicleRepository.findOne({
        where: { plateNumber: input.plateNumber },
      });

      if (exists) {
        throw new ConflictException('Plate number already exists');
      }
    }
    return vehicle;
  }
}
