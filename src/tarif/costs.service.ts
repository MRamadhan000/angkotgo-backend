import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Cost } from './entities/cost';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';

@Injectable()
export class CostsService {
  constructor(
    @InjectRepository(Cost)
    private readonly costRepository: Repository<Cost>,
  ) {}

  async findAll(): Promise<Cost[]> {
    return await this.costRepository.find();
  }

  async findOne(id: number): Promise<Cost> {
    const cost = await this.costRepository.findOne({
      where: { id },
    });

    if (!cost) {
      throw new NotFoundException('Cost not found');
    }

    return cost;
  }

  async create(createCostDto: CreateCostDto): Promise<Cost> {
    const { name, nominal } = createCostDto;

    const newCost = this.costRepository.create({
      name,
      nominal,
    });

    return await this.costRepository.save(newCost);
  }

  async update(id: number, input: UpdateCostDto): Promise<Cost> {
    const cost = await this.costRepository.findOne({
      where: { id },
    });

    if (!cost) {
      throw new NotFoundException('Cost not found');
    }

    Object.assign(cost, input);

    return await this.costRepository.save(cost);
  }

  async remove(id: number): Promise<Cost> {
    const cost = await this.costRepository.findOne({
      where: { id },
    });

    if (!cost) {
      throw new NotFoundException('Cost not found');
    }

    return await this.costRepository.remove(cost);
  }
}
