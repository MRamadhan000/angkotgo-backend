import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteStop } from '../entities/route-stop.entity';
import { Route } from '../entities/route.entity';
import { CreateRouteStopDto } from '../dto/create-route.dto';

@Injectable()
export class RouteStopsService {
  constructor(
    @InjectRepository(RouteStop)
    private readonly routeStopRepository: Repository<RouteStop>,

    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  // 1. Menambahkan Halte Baru ke Rute Tertentu
  async create(routeId: number, createRouteStopDto: CreateRouteStopDto): Promise<RouteStop> {
    // Pastikan Rute utama eksis di database
    const route = await this.routeRepository.findOne({ where: { id: routeId } });
    if (!route) {
      throw new NotFoundException(`Rute dengan ID ${routeId} tidak ditemukan`);
    }

    // Buat instance halte baru dan kaitkan relasinya
    const newStop = this.routeStopRepository.create({
      ...createRouteStopDto,
      route: route,
    });

    return await this.routeStopRepository.save(newStop);
  }

  // 2. Mengambil Semua Daftar Halte Milik Rute Tertentu (Berdasarkan Route ID)
  async findByRoute(routeId: number): Promise<RouteStop[]> {
    const route = await this.routeRepository.findOne({ where: { id: routeId } });
    if (!route) {
      throw new NotFoundException(`Rute dengan ID ${routeId} tidak ditemukan`);
    }

    return await this.routeStopRepository.find({
      where: { route: { id: routeId } },
      order: { sequence: 'ASC' }, // Urutkan berdasarkan urutan singgah halte
    });
  }

  // 3. Menghapus Satu Halte Satuan Berdasarkan ID Halte
  async remove(id: number): Promise<{ message: string }> {
    const stop = await this.routeStopRepository.findOne({ where: { id } });
    if (!stop) {
      throw new NotFoundException(`Halte dengan ID ${id} tidak ditemukan`);
    }

    await this.routeStopRepository.remove(stop);
    return { message: `Halte dengan ID ${id} berhasil dihapus.` };
  }
}