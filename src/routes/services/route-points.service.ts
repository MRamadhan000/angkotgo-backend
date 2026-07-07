import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutePoint } from '../entities/route-point.entity';
import { Route } from '../entities/route.entity';
import { CreateRoutePointDto } from '../dto/create-route.dto';

@Injectable()
export class RoutePointsService {
  constructor(
    @InjectRepository(RoutePoint)
    private readonly routePointRepository: Repository<RoutePoint>,

    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) { }

  // 1. Menambahkan Titik Koordinat Baru ke Rute Tertentu
  async create(routeId: number, createRoutePointDto: CreateRoutePointDto): Promise<RoutePoint> {
    // Pastikan Rute utamanya eksis di database
    const route = await this.routeRepository.findOne({ where: { id: routeId } });
    if (!route) {
      throw new NotFoundException(`Rute dengan ID ${routeId} tidak ditemukan`);
    }

    // Buat instance dan hubungkan relasinya
    const newPoint = this.routePointRepository.create({
      ...createRoutePointDto,
      route: route,
    });

    return await this.routePointRepository.save(newPoint);
  }

  async createBulk(routeId: number, createRoutePointDtos: CreateRoutePointDto[]): Promise<RoutePoint[]> {
    // 1. Pastikan Rute utamanya eksis di database
    const route = await this.routeRepository.findOne({ where: { id: routeId } });
    if (!route) {
      throw new NotFoundException(`Rute dengan ID ${routeId} tidak ditemukan`);
    }

    // 2. Map array DTO menjadi array entity yang terhubung dengan objek route
    const newPoints = createRoutePointDtos.map((dto) => {
      return this.routePointRepository.create({
        ...dto,
        route: route, // Hubungkan ke relasi route-nya
      });
    });

    // 3. Simpan sekaligus ke database menggunakan .save() yang menerima array
    return await this.routePointRepository.save(newPoints);
  }

  // 2. Mengambil Semua Koordinat Milik Rute Tertentu (Berdasarkan Route ID)
  async findByRoute(routeId: number): Promise<RoutePoint[]> {
    const route = await this.routeRepository.findOne({ where: { id: routeId } });
    if (!route) {
      throw new NotFoundException(`Rute dengan ID ${routeId} tidak ditemukan`);
    }

    return await this.routePointRepository.find({
      where: { route: { id: routeId } },
      order: { sequence: 'ASC' }, // Urutkan berdasarkan urutan jalur jalan
    });
  }

  // 3. Menghapus Satu Titik Koordinat Tertentu Berdasarkan ID Point
  async remove(id: number): Promise<{ message: string }> {
    const point = await this.routePointRepository.findOne({ where: { id } });
    if (!point) {
      throw new NotFoundException(`Titik koordinat dengan ID ${id} tidak ditemukan`);
    }

    await this.routePointRepository.remove(point);
    return { message: `Titik koordinat ID ${id} berhasil dihapus.` };
  }
}
