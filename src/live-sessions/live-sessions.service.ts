import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveSession, SessionStatus } from './entities/live-session.entity';
import { LiveLocation } from './entities/live-location.entity';
import { CreateLiveSessionDto } from './dto/create-live-session.dto';
import { AddLiveLocationDto } from './dto/add-live-location.dto';
import { RouteStop } from 'src/routes/entities/route-stop.entity';
import { Trip } from 'src/trips/entities/trip.entity';
import { UpdateLiveSessionDto } from './dto/update-live-session.dto';

@Injectable()
export class LiveSessionsService {
  constructor(
    @InjectRepository(LiveSession)
    private readonly sessionRepository: Repository<LiveSession>,

    @InjectRepository(LiveLocation)
    private readonly locationRepository: Repository<LiveLocation>,

    @InjectRepository(RouteStop)
    private readonly routeStopRepository: Repository<RouteStop>,

    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) { }

  // 1. Start Sesi Live Baru
  async create(createDto: CreateLiveSessionDto) {
    const trip = await this.tripRepository.findOneBy({
      id: createDto.tripId,
    });

    if (!trip) {
      throw new NotFoundException('Trip tidak ditemukan');
    }

    const currentStop = createDto.currentStopId
      ? await this.routeStopRepository.findOneBy({
        id: createDto.currentStopId,
      })
      : null;

    const nextStop = createDto.nextStopId
      ? await this.routeStopRepository.findOneBy({
        id: createDto.nextStopId,
      })
      : null;

    const session = this.sessionRepository.create({ ...createDto });
    return await this.sessionRepository.save(session);
  }

  // 2. Push Koordinat GPS baru ke dalam Sesi yang sedang berjalan
  async addLocation(sessionId: number, addLiveLocationDto: AddLiveLocationDto): Promise<LiveLocation> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException(`Live Session dengan ID ${sessionId} tidak aktif/ditemukan`);
    }

    const newLocation = this.locationRepository.create({
      ...addLiveLocationDto,
      session: session,
    });

    return await this.locationRepository.save(newLocation);
  }

  async findAll() {
    const sessions = await this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.trip', 'trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.schedule', 'schedule')
      .leftJoinAndSelect('schedule.driver', 'driver')
      .leftJoinAndSelect('schedule.vehicle', 'vehicle')
      .leftJoinAndSelect('session.locations', 'location')
      .orderBy('location.created_at', 'DESC')
      .getMany();

    return sessions;
  }

  // 3. Ambil Detail Sesi beserta Log Seluruh Koordinat GPS-nya
  async getSessionWithTracking(id: number): Promise<LiveSession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: { locations: true },
      order: { locations: { id: 'ASC' } }, // Urut berdasarkan urutan GPS masuk
    });

    if (!session) throw new NotFoundException(`Sesi tracking ID ${id} tidak ditemukan`);
    return session;
  }

  // 4. Update Status Sesi (Misal merubah ke COMPLETED atau ABANDONED pas driver selesai jalan)
  async endSession(id: number, status: SessionStatus): Promise<LiveSession> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) throw new NotFoundException(`Sesi ID ${id} tidak ditemukan`);

    session.status = status;
    session.endedAt = new Date();

    return await this.sessionRepository.save(session);
  }

  async getSessionByTripId(tripId: number): Promise<LiveSession> {
    const session = await this.sessionRepository.findOne({
      where: {
        trip: {
          id: tripId,
        },
      },
      relations: {
        trip: true,
        currentStop: true,
        nextStop: true,
      },
    });

    if (!session) {
      throw new NotFoundException(
        `Live session untuk trip ${tripId} tidak ditemukan`,
      );
    }

    return session;
  }

  async update(
    id: number,
    dto: UpdateLiveSessionDto,
  ): Promise<LiveSession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: {
        currentStop: true,
        nextStop: true,
        trip: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Live session tidak ditemukan');
    }

    if (dto.currentStopId) {
      const currentStop = await this.routeStopRepository.findOneBy({
        id: dto.currentStopId,
      });

      if (!currentStop) {
        throw new NotFoundException('Current stop tidak ditemukan');
      }

      session.currentStop = currentStop;
    }

    if (dto.nextStopId) {
      const nextStop = await this.routeStopRepository.findOneBy({
        id: dto.nextStopId,
      });

      if (!nextStop) {
        throw new NotFoundException('Next stop tidak ditemukan');
      }

      session.nextStop = nextStop;
    }

    if (dto.currentSequence !== undefined) {
      session.currentSequence = dto.currentSequence;
    }

    if (dto.nextSequence !== undefined) {
      session.nextSequence = dto.nextSequence;
    }

    if (dto.isAtStop !== undefined) {
      session.isAtStop = dto.isAtStop;
    }

    if (dto.status) {
      session.status = dto.status;
    }

    return await this.sessionRepository.save(session);
  }

  async updateStopStatus(
    sessionId: number,
    isAtStop: boolean,
  ): Promise<LiveSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Live session tidak ditemukan');
    }

    session.isAtStop = isAtStop;

    return await this.sessionRepository.save(session);
  }
}

