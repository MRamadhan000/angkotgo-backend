import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conductor } from './entities/conductor.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import * as bcrypt from 'bcrypt';
import { LoginConductorDto } from './dto/login-conductor.dto';

@Injectable()
export class ConductorsService {
  constructor(
    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,
  ) { }

  async create(createDto: CreateConductorDto): Promise<Conductor> {
    const existing = await this.conductorRepository.findOne({
      where: [
        { email: createDto.email },
        { nik: createDto.nik },
        { phone: createDto.phone },
      ],
    });

    if (existing) {
      throw new ConflictException('Email, NIK, atau nomor telepon kondektur sudah terdaftar.');
    }

    // Hash password sebelum disimpan (opsional tapi disarankan)
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const conductor = this.conductorRepository.create({
      ...createDto,
      password: hashedPassword,
    });

    return await this.conductorRepository.save(conductor);
  }

  async login(loginDto: LoginConductorDto) {
    const conductor = await this.conductorRepository.findOne({
      where: { email: loginDto.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        status: true,
      },
    });

    if (!conductor) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, conductor.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    const { password, ...result } = conductor;

    return result;
  }

  async findAll(): Promise<Conductor[]> {
    return await this.conductorRepository.find();
  }

  async findOne(id: number): Promise<Conductor> {
    const conductor = await this.conductorRepository.findOne({
      where: { id },
      relations: {
        assignments: {
          vehicle: true,
          route: true,
        },
      },
    });

    if (!conductor) {
      throw new NotFoundException(`Kondektur dengan ID ${id} tidak ditemukan.`);
    }

    return conductor;
  }

  async update(id: number, updateDto: UpdateConductorDto): Promise<Conductor> {
    const conductor = await this.findOne(id);

    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    Object.assign(conductor, updateDto);
    return await this.conductorRepository.save(conductor);
  }

  async remove(id: number): Promise<{ message: string }> {
    const conductor = await this.findOne(id);
    await this.conductorRepository.remove(conductor);
    return { message: `Kondektur dengan ID ${id} berhasil dihapus.` };
  }
}