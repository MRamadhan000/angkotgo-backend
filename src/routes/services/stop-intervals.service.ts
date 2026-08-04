import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StopInterval } from '../entities/stop-interval.entity';
import { Route } from '../entities/route.entity';
import { RouteStop } from '../entities/route-stop.entity';
import { CreateStopIntervalDto } from '../dto/create/create-stop-interval.dto';
import { UpdateStopIntervalDto } from '../dto/update/update-stop-interval.dto';

@Injectable()
export class StopIntervalsService {
    constructor(
        @InjectRepository(StopInterval)
        private readonly stopIntervalRepository: Repository<StopInterval>,
        @InjectRepository(Route)
        private readonly routeRepository: Repository<Route>,
        @InjectRepository(RouteStop)
        private readonly routeStopRepository: Repository<RouteStop>,
    ) { }

    // 1. CREATE: Menambahkan data interval durasi antar halte
    async create(createStopIntervalDto: CreateStopIntervalDto): Promise<StopInterval> {
        const { routeId, fromStopId, toStopId } = createStopIntervalDto;

        // Validasi 1: Pastikan Trayek ada
        const route = await this.routeRepository.findOne({ where: { id: routeId } });
        if (!route) {
            throw new NotFoundException(`Trayek dengan ID ${routeId} tidak ditemukan.`);
        }

        // Validasi 2: Pastikan Halte Asal ada
        const fromStop = await this.routeStopRepository.findOne({ where: { id: fromStopId } });
        if (!fromStop) {
            throw new NotFoundException(`Halte asal dengan ID ${fromStopId} tidak ditemukan.`);
        }

        // Validasi 3: Pastikan Halte Tujuan ada
        const toStop = await this.routeStopRepository.findOne({ where: { id: toStopId } });
        if (!toStop) {
            throw new NotFoundException(`Halte tujuan dengan ID ${toStopId} tidak ditemukan.`);
        }

        // Validasi tambahan: Halte asal dan tujuan tidak boleh sama
        if (fromStopId === toStopId) {
            throw new BadRequestException('Halte asal dan halte tujuan tidak boleh sama.');
        }

        const newInterval = this.stopIntervalRepository.create(createStopIntervalDto);
        return await this.stopIntervalRepository.save(newInterval);
    }

    // 2. READ (BY ROUTE & DIRECTION): Mengambil daftar interval berdasarkan trayek dan arahnya
    async findByRouteAndDirection(routeId: number, direction: string): Promise<StopInterval[]> {
        const route = await this.routeRepository.findOne({ where: { id: routeId } });
        if (!route) {
            throw new NotFoundException(`Trayek dengan ID ${routeId} tidak ditemukan.`);
        }

        return await this.stopIntervalRepository.find({
            where: { routeId, direction: direction as any },
            relations: {
                fromStop: true,
                toStop: true,
            },
        });
    }

    async findOne(id: number): Promise<StopInterval> {
        const stopInterval = await this.stopIntervalRepository.findOne({
            where: { id },
        });

        if (!stopInterval) {
            throw new NotFoundException(`Interval halte dengan ID ${id} tidak ditemukan.`);
        }

        return stopInterval;
    }
    async update(id: number, updateStopIntervalDto: UpdateStopIntervalDto): Promise<StopInterval> {
        const stopInterval = await this.findOne(id);

        // Jika routeId diubah, validasi keberadaannya
        if (updateStopIntervalDto.routeId && updateStopIntervalDto.routeId !== stopInterval.routeId) {
            const route = await this.routeRepository.findOne({ where: { id: updateStopIntervalDto.routeId } });
            if (!route) {
                throw new NotFoundException(`Trayek dengan ID ${updateStopIntervalDto.routeId} tidak ditemukan.`);
            }
        }

        // Jika fromStopId diubah
        if (updateStopIntervalDto.fromStopId && updateStopIntervalDto.fromStopId !== stopInterval.fromStopId) {
            const fromStop = await this.routeStopRepository.findOne({ where: { id: updateStopIntervalDto.fromStopId } });
            if (!fromStop) {
                throw new NotFoundException(`Halte asal dengan ID ${updateStopIntervalDto.fromStopId} tidak ditemukan.`);
            }
        }

        // Jika toStopId diubah
        if (updateStopIntervalDto.toStopId && updateStopIntervalDto.toStopId !== stopInterval.toStopId) {
            const toStop = await this.routeStopRepository.findOne({ where: { id: updateStopIntervalDto.toStopId } });
            if (!toStop) {
                throw new NotFoundException(`Halte tujuan dengan ID ${updateStopIntervalDto.toStopId} tidak ditemukan.`);
            }
        }

        Object.assign(stopInterval, updateStopIntervalDto);
        return await this.stopIntervalRepository.save(stopInterval);
    }

    async remove(id: number): Promise<{ message: string }> {
        const stopInterval = await this.findOne(id);

        await this.stopIntervalRepository.remove(stopInterval);
        return { message: `Interval halte dengan ID ${id} berhasil dihapus.` };
    }
}