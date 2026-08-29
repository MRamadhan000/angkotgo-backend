import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMockLiveLocationDto } from '../dto/create/create-mock-live-location.dto';
import { UpdateMockLiveLocationDto } from '../dto/update/update-mock-live-location.dto';
import { MockLiveLocation } from '../entities/mock-live-locations.entity';

@Injectable()
export class MockLiveLocationService {
    constructor(
        @InjectRepository(MockLiveLocation)
        private readonly repository: Repository<MockLiveLocation>,
    ) {}

    async create(dto: CreateMockLiveLocationDto) {
        const data = this.repository.create(dto);
        return this.repository.save(data);
    }

    async findAll() {
        return this.repository.find({
            relations: { route: true },
            order: { id: 'ASC' },
        });
    }

    async findOne(id: number) {
        const data = await this.repository.findOne({
            where: { id },
            relations: { route: true },
        });

        if (!data) {
            throw new NotFoundException(
                `Mock live location dengan ID ${id} tidak ditemukan`,
            );
        }

        return data;
    }

    async update(id: number, dto: UpdateMockLiveLocationDto) {
        await this.findOne(id);
        await this.repository.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const data = await this.findOne(id);
        await this.repository.remove(data);
    }
}