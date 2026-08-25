import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SinyalEntity, SinyalStatus } from './entities/provide-sinyal.entity';
import { CreateSinyalDto } from './dto/create-sinyal.dto';
import { UpdateSinyalDto } from './dto/update-sinyal.dto';
import { SinyalDetailEntity } from './entities/provide-sinyal-detail.entity';

export interface CreateSinyalResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    totalTargetAngkot: number;
  };
}

@Injectable()
export class SinyalService {
  constructor(
    @InjectRepository(SinyalEntity)
    private readonly sinyalRepository: Repository<SinyalEntity>,
    @InjectRepository(SinyalDetailEntity)
    private readonly sinyalDetailRepository: Repository<SinyalDetailEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createSinyalDto: CreateSinyalDto,
  ): Promise<CreateSinyalResponse> {
    const { latitude, longitude, vehicleAssignmentId } = createSinyalDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Buat record Sinyal Utama (Header)
      const newSinyal = this.sinyalRepository.create({
        latitude,
        longitude,
        status: SinyalStatus.ACTIVE,
        // Pada header bisa diisi null atau gabungan string jika dibutuhkan
        // vehicleAssignmentId: null,
        geom: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      });

      const savedSinyal = await queryRunner.manager.save(newSinyal);

      // 2. Jika vehicleAssignmentId dikirim berupa array (misal: ["1", "2"])
      if (vehicleAssignmentId && vehicleAssignmentId.length > 0) {
        // Buat multiple instance SinyalDetailEntity
        const detailRecords = vehicleAssignmentId.map((vId) => {
          return this.sinyalDetailRepository.create({
            idSinyal: savedSinyal.id,
            vehicleAssignmentId: vId,
          });
        });

        // Bulk save semua detail baris sekaligus
        await queryRunner.manager.save(detailRecords);
      }

      await queryRunner.commitTransaction();

      // Return sinyal beserta array detail-nya
      return {
        statusCode: 201,
        message: 'Sinyal penumpang berhasil dibuat',
        data: {
          id: savedSinyal.id,
          totalTargetAngkot: vehicleAssignmentId
            ? vehicleAssignmentId.length
            : 0,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Filter sinyal berdasarkan vehicleAssignmentId di tabel detail
  async findActiveSinyalByVehicle(
    vehicleAssignmentId: string,
  ): Promise<SinyalEntity[]> {
    return await this.sinyalRepository
      .createQueryBuilder('sinyal')
      .innerJoinAndSelect('sinyal.details', 'detail')
      .where('sinyal.status = :status', { status: SinyalStatus.ACTIVE })
      .andWhere('detail.vehicleAssignmentId = :vehicleAssignmentId', {
        vehicleAssignmentId,
      })
      .orderBy('sinyal.createdAt', 'DESC')
      .getMany();
  }

  // PATCH: Driver menerima/mengunci sinyal penumpang
  async updateSinyal(
    id: string,
    updateSinyalDto: UpdateSinyalDto,
  ): Promise<SinyalEntity> {
    const sinyal = await this.sinyalRepository.findOne({ where: { id } });

    if (!sinyal) {
      throw new NotFoundException(`Sinyal dengan ID ${id} tidak ditemukan`);
    }

    sinyal.status = updateSinyalDto.status;

    return await this.sinyalRepository.save(sinyal);
  }
}
