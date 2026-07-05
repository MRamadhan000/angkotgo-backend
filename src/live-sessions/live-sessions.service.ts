import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveSession, SessionStatus } from './entities/live-session.entity';
import { LiveLocation } from './entities/live-location.entity';
import { CreateLiveSessionDto } from './dto/create-live-session.dto';
import { AddLiveLocationDto } from './dto/add-live-location.dto';

@Injectable()
export class LiveSessionsService {
  constructor(
    @InjectRepository(LiveSession)
    private readonly sessionRepository: Repository<LiveSession>,

    @InjectRepository(LiveLocation)
    private readonly locationRepository: Repository<LiveLocation>,
  ) {}

  // 1. Start Sesi Live Baru
  async startSession(createLiveSessionDto: CreateLiveSessionDto): Promise<LiveSession> {
    const newSession = this.sessionRepository.create(createLiveSessionDto);
    return await this.sessionRepository.save(newSession);
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
}
