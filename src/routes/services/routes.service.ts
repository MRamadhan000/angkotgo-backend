import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  //  ROUTE SERVICES
  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    try {
      const newRoute = this.routeRepository.create(createRouteDto);
      return await this.routeRepository.save(newRoute);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Kode rute (route code) sudah terdaftar!');
      }
      throw error;
    }
  }

  async findAll(): Promise<Route[]> {
    // FIX: Mengubah array string menjadi format objek literal boolean
    return await this.routeRepository.find({
      relations: {
        // points: true,
        // stops: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Route> {
    // FIX: Mengubah array string menjadi format objek literal boolean
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: {
        points: true,
        stops: true,
      },
    });

    if (!route) {
      throw new NotFoundException(`Rute dengan ID ${id} tidak ditemukan`);
    }

    return route;
  }

  // FIX: Menambahkan method update agar controller tidak error
  async update(id: number, input: UpdateRouteDto): Promise<Route> {
    const route = await this.routeRepository.findOne({ where: { id } });

    if (!route) {
      throw new NotFoundException('Route not found');
    }
    await this.ensureUniqueRoute(input, route);

    Object.assign(route, input); // Gabungkan data lama dengan data baru yang masuk

    return await this.routeRepository.save(route);
  }

  async remove(id: number): Promise<{ message: string }> {
    const route = await this.findOne(id);
    await this.routeRepository.remove(route);
    return {
      message: `Rute dengan ID ${id} berhasil dihapus beserta titik koordinatnya.`,
    };
  }

  // Validasi Unique Rute Berdasarkan Kode Rute
  async ensureUniqueRoute(input: UpdateRouteDto, route: Route): Promise<Route> {
    if (input.code !== route.code) {
      const exists = await this.routeRepository.findOne({
        where: { code: input.code },
      });

      if (exists) {
        throw new ConflictException('Route code already exists');
      }
    }

    return route;
  }
}
