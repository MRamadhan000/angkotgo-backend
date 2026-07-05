import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) { }

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    try {
      const newDriver = this.driverRepository.create(createDriverDto);
      return await this.driverRepository.save(newDriver);
    } catch (error : any) {
      // Cast error ke tipe any atau objek spesifik saat pengecekan
      if (error.code === '23505') {
        throw new ConflictException('Nomor HP atau Nomor SIM sudah terdaftar!');
      }
      throw error;
    }
  }

  async findAll(): Promise<Driver[]> {
    return await this.driverRepository.find();
  }
}