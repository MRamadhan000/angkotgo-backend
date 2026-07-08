import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver, DriverStatus } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { start } from 'repl';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  // Get All Drivers
  async findAll(): Promise<Driver[]> {
    return await this.driverRepository.find();
  }

  // Get Driver by ID
  async findOne(id: number): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  // Create a new Driver
  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    try {
      const newDriver = this.driverRepository.create(createDriverDto);
      return await this.driverRepository.save(newDriver);
    } catch (error: any) {
      // Cast error ke tipe any atau objek spesifik saat pengecekan
      if (error.code === '23505') {
        throw new ConflictException('Nomor HP atau Nomor SIM sudah terdaftar!');
      }
      throw error;
    }
  }

  // Update Driver by ID
  async update(id: number, input: UpdateDriverDto): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    await this.ensureUniqueDriver(input, driver);

    Object.assign(driver, input);

    return await this.driverRepository.save(driver);
  }

  // Deactivate Driver by ID
  async deactivate(id: number): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    driver.status = DriverStatus.INACTIVE;
    return await this.driverRepository.save(driver);
  }

  // Ensure unique phone and license number
  async ensureUniqueDriver(
    input: UpdateDriverDto,
    driver: Driver,
  ): Promise<Driver> {
    if (input.phone && input.phone !== driver.phone) {
      const exists = await this.driverRepository.findOne({
        where: { phone: input.phone },
      });

      if (exists) {
        throw new ConflictException('Phone number already exists');
      }
    }

    if (input.licenseNumber && input.licenseNumber !== driver.licenseNumber) {
      const exists = await this.driverRepository.findOne({
        where: { licenseNumber: input.licenseNumber },
      });

      if (exists) {
        throw new ConflictException('License number already exists');
      }
    }
    return driver;
  }

  // Login Driver
  async login(phone: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { phone },
    });

    if (!driver) {
      throw new NotFoundException('Nomor HP tidak terdaftar');
    }

    if (driver.status === DriverStatus.INACTIVE) {
      throw new ConflictException('Status driver tidak aktif');
    }

    return driver;
  }
}
