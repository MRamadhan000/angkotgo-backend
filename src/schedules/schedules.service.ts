import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) { }

  // 1. Buat Schedule Baru
  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    // Kita petakan ID dari DTO ke bentuk struktur entity relasi TypeORM
    const newSchedule = this.scheduleRepository.create({
      workDate: createScheduleDto.workDate,
      shift: createScheduleDto.shift,
      driver: { id: createScheduleDto.driverId },
      vehicle: { id: createScheduleDto.vehicleId },
    });

    return await this.scheduleRepository.save(newSchedule);
  }

  // 2. Ambil Semua Schedule (Beserta detail driver, mobil, rute, dan trips aktualnya)
  async findAll(): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      relations: {
        driver: true,
        vehicle: true,
        trips: {
          route: true,
        },
      },
      order: { workDate: 'DESC', shift: 'ASC' },
    });
  }

  // 3. Ambil Satu Schedule Berdasarkan ID
  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: {
        driver: true,
        vehicle: true,
        trips: {
          route : true
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule dengan ID ${id} tidak ditemukan`);
    }
    return schedule;
  }

  // 4. Update Kontrak Schedule
  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    // 1. Cari jadwal yang mau di-update
    const schedule = await this.scheduleRepository.findOneBy({ id });
    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    // 2. Hanya masukkan field yang diizinkan saja ke objek entity
    if (updateScheduleDto.workDate !== undefined) {
      schedule.workDate = updateScheduleDto.workDate;
    }

    if (updateScheduleDto.shift !== undefined) {
      schedule.shift = updateScheduleDto.shift;
    }

    if (updateScheduleDto.createdAt !== undefined) {
      schedule.createdAt = new Date(updateScheduleDto.createdAt);
    }

    // 3. Simpan perubahan (Data driver, vehicle, dan trips aman tidak tersentuh)
    return await this.scheduleRepository.save(schedule);
  }

  // 5. Hapus Schedule (Otomatis cascade delete trips di dalamnya)
  async remove(id: number): Promise<{ message: string }> {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
    return { message: `Schedule ID ${id} berhasil dihapus beserta seluruh trips terkait.` };
  }

  // 6. Ambil Schedule Berdasarkan User/Driver ID
  async findByUserId(userId: number): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { driver: { id: userId } },
      relations: {
        driver: true,
        vehicle: true,
        trips: {
          route: true
        },
      },
      order: { workDate: 'ASC', shift: 'ASC' },
    });
  }
}
