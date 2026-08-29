import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from '../dto/create/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update/update-vehicle.dto';
import { Vehicle } from '../entities/vehicle.entity';
import { VehicleAssignment } from '../entities/vehicle-assignment.entity';
import { VehicleService } from '../entities/vehicle-service.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) { }

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existingVehicle = await this.vehicleRepository.findOne({
      where: [
        { plateNumber: createVehicleDto.plateNumber },
        { vehicleCode: createVehicleDto.vehicleCode },
      ],
    });

    if (existingVehicle) {
      throw new ConflictException('Nomor plat atau kode kendaraan sudah terdaftar.');
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async findAll() {
    return this.vehicleRepository
      .createQueryBuilder('vehicle')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(assignment.id)', 'count')
          .from(VehicleAssignment, 'assignment')
          .where('assignment.vehicle_id = vehicle.id');
      }, 'assignmentCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(service.id)', 'count')
          .from(VehicleService, 'service')
          .where('service.vehicle_id = vehicle.id');
      }, 'serviceCount')
      .orderBy('vehicle.id', 'ASC')
      .getRawAndEntities()
      .then(({ entities, raw }) =>
        entities.map((vehicle, index) => ({
          ...vehicle,
          assignmentCount: Number(raw[index].assignmentCount ?? 0),
          serviceCount: Number(raw[index].serviceCount ?? 0),
        })),
      );
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Kendaraan dengan ID ${id} tidak ditemukan.`);
    }
    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    Object.assign(vehicle, updateVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async remove(id: number): Promise<{ message: string }> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
    return { message: `Kendaraan dengan ID ${id} berhasil dihapus` };
  }
}