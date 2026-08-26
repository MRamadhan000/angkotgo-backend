import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Driver, DriverStatus } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) { }

  async findAll(): Promise<Driver[]> {
    return await this.driverRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createDriverDto.password, saltRounds);

      const newDriver = this.driverRepository.create({
        ...createDriverDto,
        password: hashedPassword,
      });

      return await this.driverRepository.save(newDriver);
    } catch (error: any) {
      if (error.code === '23505') {
        const detail = error.detail || '';
        if (detail.includes('nik')) {
          throw new ConflictException('NIK sudah terdaftar!');
        }
        if (detail.includes('email')) {
          throw new ConflictException('Email sudah terdaftar!');
        }
        if (detail.includes('phone')) {
          throw new ConflictException('Nomor HP sudah terdaftar!');
        }
        if (detail.includes('license_number')) {
          throw new ConflictException('Nomor SIM sudah terdaftar!');
        }
        throw new ConflictException('Data unik sudah terdaftar di sistem!');
      }
      throw error;
    }
  }

  async login(email: string, pass: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { email },
    });

    if (!driver) {
      throw new NotFoundException('Email tidak terdaftar');
    }

    const isPasswordValid = await bcrypt.compare(pass, driver.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password salah');
    }

    if (!driver.isVerified) {
      throw new UnauthorizedException('Akun driver belum diverifikasi');
    }

    if (driver.status === DriverStatus.SUSPENDED) {
      throw new ConflictException('Akun driver sedang ditangguhkan (suspended)');
    }

    return driver;
  }

  async update(id: number, input: UpdateDriverDto): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    await this.ensureUniqueDriver(input, driver);

    if (input.password) {
      input.password = await bcrypt.hash(input.password, 10);
    }

    Object.assign(driver, input);

    return await this.driverRepository.save(driver);
  }

  async updateStatus(id: number, status: DriverStatus): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    driver.status = status;
    return await this.driverRepository.save(driver);
  }

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

    if (input.email && (input as any).email !== driver.email) {
      const exists = await this.driverRepository.findOne({
        where: { email: (input as any).email },
      });

      if (exists) {
        throw new ConflictException('Email already exists');
      }
    }

    return driver;
  }

  async deactivate(id: number): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    driver.status = DriverStatus.OFF_DUTY;
    return await this.driverRepository.save(driver);
  }

  async remove(id: number): Promise<DeleteResult> {
    const driver = await this.driverRepository.findOne({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return await this.driverRepository.softDelete(id);
  }
}