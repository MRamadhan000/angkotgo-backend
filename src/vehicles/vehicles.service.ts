import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) { }

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    try {
      const newVehicle = this.vehicleRepository.create(createVehicleDto);
      return await this.vehicleRepository.save(newVehicle);
    } catch (error: any) {
      // Kode '23505' adalah unik/duplicate error milik PostgreSQL
      if (error.code === '23505') {
        throw new ConflictException('Plat nomor atau Kode lambung kendaraan sudah terdaftar!');
      }
      throw error;
    }
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.vehicleRepository.find();
  }
}