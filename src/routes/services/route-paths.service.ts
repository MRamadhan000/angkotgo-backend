import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoutePathDto } from '../dto/create/create-route-path.dto';
import { UpdateRoutePathDto } from '../dto/update/update-route-path.dto';
import { RoutePath } from '../entities/route-path.entity';
import { Route } from '../entities/route.entity';

export enum MockLocationLevel {
    LEVEL_1 = 1,
    LEVEL_2 = 2,
    LEVEL_3 = 3,
    LEVEL_4 = 4,
    LEVEL_5 = 5,
}

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
    async getMockPoints(
        routeId: number,
        direction: string,
        level: MockLocationLevel,
    ): Promise<RoutePath[]> {
        const route = await this.routeRepository.findOne({
            where: { id: routeId },
        });

        if (!route) {
            throw new NotFoundException(
                `Trayek dengan ID ${routeId} tidak ditemukan.`,
            );
        }

        const paths = await this.routePathRepository.find({
            where: {
                routeId,
                direction: direction as any,
            },
            order: {
                sequenceOrder: 'ASC',
            },
        });

        if (!paths.length) {
            return [];
        }

        const total = paths.length;
        const maxPoints = 15;

        if (level === MockLocationLevel.LEVEL_5) {
            if (total <= maxPoints) {
                return paths;
            }

            const result: RoutePath[] = [];

            result.push(paths[0]);

            const step = (total - 1) / (maxPoints - 1);

            for (let i = 1; i < maxPoints - 1; i++) {
                const index = Math.round(i * step);

                result.push(paths[index]);
            }

            result.push(paths[total - 1]);

            return result;
        }

        /**
         * LEVEL 1 - 4
         * ------------
         * Mengambil titik dari awal sampai persentase
         * tertentu secara random.
         */
        const ranges = {
            [MockLocationLevel.LEVEL_1]: [0, 0.30],
            [MockLocationLevel.LEVEL_2]: [0.31, 0.50],
            [MockLocationLevel.LEVEL_3]: [0.51, 0.80],
            [MockLocationLevel.LEVEL_4]: [0.81, 1],
        };

        const range = ranges[level];

        if (!range) {
            throw new BadRequestException(
                'Level mock harus bernilai 1, 2, 3, 4, atau 5.',
            );
        }

        const [minPercent, maxPercent] = range;

        const minIndex = Math.floor(total * minPercent);

        const maxIndex = Math.min(
            Math.floor(total * maxPercent),
            total - 1,
        );

        // Tentukan titik akhir secara random
        const lastIndex =
            Math.floor(
                Math.random() * (maxIndex - minIndex + 1),
            ) + minIndex;

        const endIndex = Math.max(lastIndex, 1);

        const result: RoutePath[] = [];

        /**
         * Maksimal 15 titik
         */
        const step = Math.max(
            1,
            Math.floor(endIndex / (maxPoints - 1)),
        );

        /**
         * Selalu mulai dari titik pertama
         * kemudian mengambil titik sampai endIndex.
         */
        for (let i = 0; i <= endIndex; i += step) {
            result.push(paths[i]);
        }

        /**
         * Pastikan titik terakhir yang dipilih
         * adalah endIndex.
         */
        if (result[result.length - 1] !== paths[endIndex]) {
            result.push(paths[endIndex]);
        }

        return result;
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