import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Trip } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) { }

  async create(createTripDto: CreateTripDto): Promise<Trip> {
    const newTrip = this.tripRepository.create({
      tripNumber: createTripDto.tripNumber,
      plannedDeparture: createTripDto.plannedDeparture,
      plannedArrival: createTripDto.plannedArrival,
      status: createTripDto.status,

      schedule: {
        id: createTripDto.scheduleId,
      },

      route: {
        id: createTripDto.routeId,
      },
    });

    return await this.tripRepository.save(newTrip);
  }

  async findAll(): Promise<Trip[]> {
    return await this.tripRepository.find({
      relations: {
        schedule: true,
        route: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: {
        schedule: true,
        route: true,
        liveSessions :true,
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip dengan ID ${id} tidak ditemukan`);
    }

    return trip;
  }

  async update(
    id: number,
    updateTripDto: UpdateTripDto,
  ): Promise<Trip> {
    const trip = await this.findOne(id);

    if (updateTripDto.scheduleId) {
      trip.schedule = {
        id: updateTripDto.scheduleId,
      } as any;
    }

    if (updateTripDto.routeId) {
      trip.route = {
        id: updateTripDto.routeId,
      } as any;
    }

    if (updateTripDto.tripNumber !== undefined) {
      trip.tripNumber = updateTripDto.tripNumber;
    }

    if (updateTripDto.plannedDeparture !== undefined) {
      trip.plannedDeparture = updateTripDto.plannedDeparture;
    }

    if (updateTripDto.plannedArrival !== undefined) {
      trip.plannedArrival = updateTripDto.plannedArrival;
    }

    if (updateTripDto.status !== undefined) {
      trip.status = updateTripDto.status;
    }

    return await this.tripRepository.save(trip);
  }

  async remove(id: number): Promise<{ message: string }> {
    const trip = await this.findOne(id);

    await this.tripRepository.remove(trip);

    return {
      message: `Trip ID ${id} sukses dihapus.`,
    };
  }
}