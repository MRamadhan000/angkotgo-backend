import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteStop } from '../entities/route-stop.entity';
import { Route } from '../entities/route.entity';
import { CreateRouteStopDto } from '../dto/create/create-route-stop.dto';
import { UpdateRouteStopDto } from '../dto/update/update-route-stop.dto';

@Injectable()
export class RouteStopsService {
  constructor(
    @InjectRepository(RouteStop)
    private readonly routeStopRepository: Repository<RouteStop>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  async create(createRouteStopDto: CreateRouteStopDto): Promise<RouteStop> {
    // Pastikan ID trayek (routeId) benar-benar ada di database
    const route = await this.routeRepository.findOne({
      where: { id: createRouteStopDto.routeId },
    });

    if (!route) {
      throw new NotFoundException(`Trayek dengan ID ${createRouteStopDto.routeId} tidak ditemukan.`);
    }

    const newStop = this.routeStopRepository.create(createRouteStopDto);
    return await this.routeStopRepository.save(newStop);
  }

  async findByRouteAndDirection(routeId: number, direction: string): Promise<RouteStop[]> {
    // Validasi apakah trayeknya ada
    const route = await this.routeRepository.findOne({ where: { id: routeId } });
    if (!route) {
      throw new NotFoundException(`Trayek dengan ID ${routeId} tidak ditemukan.`);
    }

    return await this.routeStopRepository.find({
      where: { routeId, direction: direction as any },
      order: { stopOrder: 'ASC' }, // Urutkan halte dari urutan ke-1 sampai akhir
    });
  }

  async findOne(id: number): Promise<RouteStop> {
    const routeStop = await this.routeStopRepository.findOne({ where: { id } });

    if (!routeStop) {
      throw new NotFoundException(`Halte dengan ID ${id} tidak ditemukan.`);
    }

    return routeStop;
  }

  async update(id: number, updateRouteStopDto: UpdateRouteStopDto): Promise<RouteStop> {
    const routeStop = await this.findOne(id); // Pastikan halte yang mau di-update ada

    // Jika routeId ikut diubah, pastikan route baru tersebut ada di database
    if (updateRouteStopDto.routeId && updateRouteStopDto.routeId !== routeStop.routeId) {
      const route = await this.routeRepository.findOne({ where: { id: updateRouteStopDto.routeId } });
      if (!route) {
        throw new NotFoundException(`Trayek dengan ID ${updateRouteStopDto.routeId} tidak ditemukan.`);
      }
    }

    Object.assign(routeStop, updateRouteStopDto);
    return await this.routeStopRepository.save(routeStop);
  }

  // 5. DELETE: Menghapus satu halte berdasarkan ID
  async remove(id: number): Promise<{ message: string }> {
    const routeStop = await this.findOne(id); // Pastikan ada sebelum dihapus

    await this.routeStopRepository.remove(routeStop);
    return { message: `Halte dengan ID ${id} berhasil dihapus.` };
  }
}