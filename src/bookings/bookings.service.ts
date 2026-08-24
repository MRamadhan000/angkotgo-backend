import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from 'src/user/entities/user.entitiy';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import { BookingStatus } from './enum/booking.enum';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async findAll(): Promise<Booking[]> {
    const bookings = await this.bookingRepository.find();
    return bookings;
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking data not found');
    }

    return booking;
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { userId, vehicleAssignmentId, passengerCount, paymentMethod } =
      createBookingDto;

    // 1. Inisialisasi Database Transaction (QueryRunner)
    const queryRunner =
      this.bookingRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Ambil data User
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
      }

      // 3. Ambil data VehicleAssignment beserta relasi Vehicle & Route
      const assignment = await queryRunner.manager.findOne(VehicleAssignment, {
        where: { id: vehicleAssignmentId },
        relations: {
          vehicle: true, // Force TypeORM melakukan LEFT JOIN ke tabel vehicles
          route: true, // Force TypeORM melakukan LEFT JOIN ke tabel routes
        },
      });

      if (!assignment) {
        throw new NotFoundException(
          `Data kendaraan dengan ID ${vehicleAssignmentId} tidak ditemukan`,
        );
      }

      // 5. Cek sisa kapasitas kendaraan
      const vehicleCapacity = assignment.vehicle.capacity;
      const currentPassengers = assignment.currentPassengers;
      const availableSeats = vehicleCapacity - currentPassengers;

      if (passengerCount > availableSeats) {
        throw new BadRequestException(
          `Kapasitas kendaraan tidak mencukupi. Sisa kursi: ${availableSeats}, Jumlah dipesan: ${passengerCount}`,
        );
      }

      const harga = 5000;
      const totalAmount = harga * passengerCount;

      // Ambil nilai assignment_date dan start_time
      const datePart = new Date(assignment.assignmentDate)
        .toISOString()
        .split('T')[0];
      const timePart = assignment.startTime;

      // Gabungkan nilai start time dan assignmet_date
      const validUntil = new Date(`${datePart}T${timePart}`);

      // 7. Buat Entity Booking baru
      const booking = queryRunner.manager.create(Booking, {
        user,
        userId,
        vehicleAssignment: assignment,
        vehicleAssignmentId,
        passengerCount,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        validUntil: validUntil,
        status: BookingStatus.PENDING,
      });

      // Simpan Booking ke database
      const savedBooking = await queryRunner.manager.save(Booking, booking);

      // 8. Update kuota penumpang aktif pada VehicleAssignment
      assignment.currentPassengers += passengerCount;
      await queryRunner.manager.save(VehicleAssignment, assignment);

      // 9. Commit transaksi jika semua sukses
      await queryRunner.commitTransaction();

      return savedBooking;
    } catch (error) {
      // Rollback jika terjadi kesalahan/gagal
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        // @ts-ignore
        `Gagal membuat booking : ${error.message || error}`,
      );
    } finally {
      // Lepaskan koneksi query runner
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.status = status;
    return await this.bookingRepository.save(booking);
  }

  async remove(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    // Validasi Skema Pembatalan Maks H-1
    if (booking.validUntil) {
      // Hitung selisih waktu presisi hingga jam dan menit
      const now = new Date();
      const validUntilDate = new Date(booking.validUntil);

      const diffInMilliseconds = validUntilDate.getTime() - now.getTime();
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

      // Jika selisih waktu kurang dari 24 jam
      if (diffInHours < 24) {
        throw new BadRequestException(
          `Pembatalan booking gagal. Pembatalan harus dilakukan minimal 24 jam sebelum jam keberangkatan.`,
        );
      }
    }

    booking.status = BookingStatus.CANCELLED;

    // Pembatalan mengembalikan kuota penumpang di VehicleAssignment
    if (booking.vehicleAssignmentId) {
      await this.bookingRepository.manager.decrement(
        VehicleAssignment,
        { id: booking.vehicleAssignmentId },
        'currentPassengers',
        booking.passengerCount,
      );
    }

    return await this.bookingRepository.save(booking);
  }
}
