import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoutePathDto } from '../dto/create/create-route-path.dto';
import { UpdateRoutePathDto } from '../dto/update/update-route-path.dto';
import { RoutePath } from '../entities/route-path.entity';
import { Route } from '../entities/route.entity';

@Injectable()
export class RoutePathsService {
    constructor(
        @InjectRepository(RoutePath)
        private readonly routePathRepository: Repository<RoutePath>,
        @InjectRepository(Route)
        private readonly routeRepository: Repository<Route>,
    ) { }

    async create(createRoutePathDto: CreateRoutePathDto): Promise<RoutePath> {
        const route = await this.routeRepository.findOne({
            where: { id: createRoutePathDto.routeId },
        });

        if (!route) {
            throw new NotFoundException(`Trayek dengan ID ${createRoutePathDto.routeId} tidak ditemukan.`);
        }

        const newPath = this.routePathRepository.create(createRoutePathDto);
        return await this.routePathRepository.save(newPath);
    }

    async createBulk(createRoutePathsDto: CreateRoutePathDto[]): Promise<RoutePath[]> {
        if (!createRoutePathsDto || createRoutePathsDto.length === 0) {
            throw new NotFoundException('Data titik jalur tidak boleh kosong.');
        }

        // Ambil routeId dari data pertama untuk validasi keberadaan trayek
        const routeId = createRoutePathsDto[0].routeId;
        const route = await this.routeRepository.findOne({
            where: { id: routeId },
        });

        if (!route) {
            throw new NotFoundException(`Trayek dengan ID ${routeId} tidak ditemukan.`);
        }

        const newPaths = this.routePathRepository.create(createRoutePathsDto);
        return await this.routePathRepository.save(newPaths);
    }

    async findByRouteAndDirection(routeId: number, direction: string): Promise<RoutePath[]> {
        // Validasi apakah trayeknya ada
        const route = await this.routeRepository.findOne({ where: { id: routeId } });
        if (!route) {
            throw new NotFoundException(`Trayek dengan ID ${routeId} tidak ditemukan.`);
        }

        return await this.routePathRepository.find({
            where: { routeId, direction: direction as any },
            order: { sequenceOrder: 'ASC' },
        });
    }

    async update(id: number, updateRoutePathDto: UpdateRoutePathDto): Promise<RoutePath> {
        const routePath = await this.routePathRepository.findOne({ where: { id } });

        if (!routePath) {
            throw new NotFoundException(`Titik koordinat jalur dengan ID ${id} tidak ditemukan.`);
        }

        if (updateRoutePathDto.routeId && updateRoutePathDto.routeId !== routePath.routeId) {
            const route = await this.routeRepository.findOne({ where: { id: updateRoutePathDto.routeId } });
            if (!route) {
                throw new NotFoundException(`Trayek dengan ID ${updateRoutePathDto.routeId} tidak ditemukan.`);
            }
        }

        Object.assign(routePath, updateRoutePathDto);
        return await this.routePathRepository.save(routePath);
    }

    async remove(id: number): Promise<{ message: string }> {
        const routePath = await this.routePathRepository.findOne({ where: { id } });

        if (!routePath) {
            throw new NotFoundException(`Titik koordinat jalur dengan ID ${id} tidak ditemukan.`);
        }

        await this.routePathRepository.remove(routePath);
        return { message: `Titik koordinat jalur dengan ID ${id} berhasil dihapus.` };
    }

    // 5. DELETE BY ROUTE & DIRECTION: Menghapus seluruh jalur pada arah tertentu (Berguna jika admin ingin reset/menggambar ulang peta)
    async removeByRouteAndDirection(routeId: number, direction: string): Promise<{ message: string }> {
        await this.routePathRepository.delete({ routeId, direction: direction as any });
        return { message: `Seluruh titik jalur untuk trayek ID ${routeId} dengan arah ${direction} berhasil dibersihkan.` };
    }
}