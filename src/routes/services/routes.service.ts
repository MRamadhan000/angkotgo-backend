import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRouteDto } from '../dto/create/create-route.dto';
import { UpdateRouteDto } from '../dto/update/update-route.dto';
import { Route } from '../entities/route.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) { }

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    // Cek apakah kode trayek sudah ada sebelumnya
    const existingRoute = await this.routeRepository.findOne({
      where: { routeCode: createRouteDto.routeCode },
    });

    if (existingRoute) {
      throw new ConflictException(`Trayek dengan kode '${createRouteDto.routeCode}' sudah terdaftar.`);
    }

    const newRoute = this.routeRepository.create(createRouteDto);
    return await this.routeRepository.save(newRoute);
  }

  async findAll(): Promise<Route[]> {
    return await this.routeRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Route> {
    const route = await this.routeRepository.findOne({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException(`Trayek dengan ID ${id} tidak ditemukan.`);
    }

    return route;
  }

  async update(id: number, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);

    if (updateRouteDto.routeCode && updateRouteDto.routeCode !== route.routeCode) {
      const existingRoute = await this.routeRepository.findOne({
        where: { routeCode: updateRouteDto.routeCode },
      });

      if (existingRoute) {
        throw new ConflictException(`Kode trayek '${updateRouteDto.routeCode}' sudah digunakan oleh trayek lain.`);
      }
    }

    Object.assign(route, updateRouteDto);

    return await this.routeRepository.save(route);
  }

  async remove(id: number): Promise<{ message: string }> {
    const route = await this.findOne(id);

    await this.routeRepository.remove(route);

    return { message: `Trayek dengan ID ${id} berhasil dihapus.` };
  }
}