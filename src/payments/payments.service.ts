import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Payment,
  PaymentStatus,
  PaymentType,
} from './entities/payment.entity';

import { CreatePaymentDto } from './dto/create-payment.dto';

import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(VehicleAssignment)
    private readonly vehicleAssignmentRepository: Repository<VehicleAssignment>,
  ) {}

  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: number,
  ) {
    const {
      vehicleAssignmentId,
      paymentType,
      amount,
    } = createPaymentDto;

    // =====================================================
    // 1. CEK VEHICLE ASSIGNMENT
    // =====================================================

    const vehicleAssignment =
      await this.vehicleAssignmentRepository.findOne({
        where: {
          id: vehicleAssignmentId,
        },
      });

    if (!vehicleAssignment) {
      throw new NotFoundException(
        'Vehicle assignment tidak ditemukan',
      );
    }

    // =====================================================
    // 2. VALIDASI NOMINAL
    // =====================================================

    if (!amount || amount <= 0) {
      throw new BadRequestException(
        'Nominal pembayaran harus lebih dari 0',
      );
    }

    // =====================================================
    // 3. VALIDASI PAYMENT TYPE
    // =====================================================

    if (
      paymentType !== PaymentType.CASH &&
      paymentType !== PaymentType.ONLINE
    ) {
      throw new BadRequestException(
        'Payment type tidak valid',
      );
    }

    // =====================================================
    // 4. GENERATE PAYMENT CODE
    // =====================================================

    const paymentCode =
      this.generatePaymentCode();

    // =====================================================
    // 5. BUAT PAYMENT
    // =====================================================

    const payment =
      this.paymentRepository.create({
        paymentCode,

        vehicleAssignmentId,

        userId,

        paymentType,

        amount,

        status: PaymentStatus.PENDING,

        midtransOrderId: null,
        midtransTransactionId: null,
        midtransPaymentType: null,
        midtransTransactionStatus: null,
        midtransTransactionTime: null,
        midtransSettlementTime: null,

        paidAt: null,
      });

    const savedPayment =
      await this.paymentRepository.save(payment);

    // =====================================================
    // 6. CASH
    // =====================================================

    if (
      paymentType === PaymentType.CASH
    ) {
      return {
        message:
          'Pembayaran cash berhasil dibuat',

        data: {
          paymentId:
            savedPayment.id,

          paymentCode:
            savedPayment.paymentCode,

          vehicleAssignmentId:
            savedPayment.vehicleAssignmentId,

          userId:
            savedPayment.userId,

          paymentType:
            savedPayment.paymentType,

          amount:
            savedPayment.amount,

          status:
            savedPayment.status,
        },
      };
    }

    // =====================================================
    // 7. ONLINE / QRIS
    // =====================================================

    return this.createMidtransPayment(
      savedPayment,
    );
  }

  // =====================================================
  // CREATE MIDTRANS QRIS
  // =====================================================

  private async createMidtransPayment(
    payment: Payment,
  ) {
    const serverKey =
      process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      throw new BadRequestException(
        'MIDTRANS_SERVER_KEY belum dikonfigurasi',
      );
    }

    const orderId =
      payment.paymentCode;

    try {
      // ===================================================
      // BASIC AUTH
      // ===================================================

      const auth = Buffer
        .from(`${serverKey}:`)
        .toString('base64');

      // ===================================================
      // WEBHOOK URL
      // ===================================================

      const notificationUrl =
        process.env.MIDTRANS_NOTIFICATION_URL;

      // ===================================================
      // REQUEST KE MIDTRANS
      // ===================================================

      const response = await fetch(
        'https://api.sandbox.midtrans.com/v2/charge',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Basic ${auth}`,

            'Content-Type':
              'application/json',

            Accept:
              'application/json',

            ...(notificationUrl && {
              'X-Override-Notification':
                notificationUrl,
            }),
          },

          body: JSON.stringify({
            payment_type: 'qris',

            transaction_details: {
              order_id: orderId,

              gross_amount:
                Number(payment.amount),
            },

            qris: {
              acquirer: 'gopay',
            },
          }),
        },
      );

      // ===================================================
      // PARSE RESPONSE
      // ===================================================

      const midtransData =
        await response.json();

      // ===================================================
      // CEK RESPONSE
      // ===================================================

      if (!response.ok) {
        payment.status =
          PaymentStatus.FAILED;

        await this.paymentRepository.save(
          payment,
        );

        throw new BadRequestException({
          message:
            'Gagal membuat pembayaran Midtrans',

          error:
            midtransData,
        });
      }

      // ===================================================
      // AMBIL QR CODE URL
      // ===================================================

      const qrCodeUrl =
        midtransData.actions?.find(
          (action: any) =>
            action.name ===
            'generate-qr-code',
        )?.url ?? null;

      // ===================================================
      // AMBIL QR STRING
      // ===================================================

      const qrString =
        midtransData.qr_string ??
        null;

      // ===================================================
      // VALIDASI QRIS
      // ===================================================

      if (!qrCodeUrl && !qrString) {
        payment.status =
          PaymentStatus.FAILED;

        await this.paymentRepository.save(
          payment,
        );

        throw new BadRequestException(
          'QRIS berhasil dibuat tetapi data QR tidak ditemukan',
        );
      }

      // ===================================================
      // SIMPAN DATA MIDTRANS
      // ===================================================

      payment.midtransOrderId =
        midtransData.order_id ??
        orderId;

      payment.midtransTransactionId =
        midtransData.transaction_id ??
        null;

      payment.midtransPaymentType =
        midtransData.payment_type ??
        null;

      payment.midtransTransactionStatus =
        midtransData.transaction_status ??
        null;

      payment.midtransTransactionTime =
        midtransData.transaction_time
          ? new Date(
              midtransData.transaction_time,
            )
          : null;

      await this.paymentRepository.save(
        payment,
      );

      // ===================================================
      // RETURN KE FRONTEND
      // ===================================================

      return {
        message:
          'Pembayaran QRIS berhasil dibuat',

        data: {
          paymentId:
            payment.id,

          paymentCode:
            payment.paymentCode,

          vehicleAssignmentId:
            payment.vehicleAssignmentId,

          amount:
            payment.amount,

          paymentType:
            payment.paymentType,

          status:
            payment.status,

          midtrans: {
            orderId:
              payment.midtransOrderId,

            transactionId:
              payment.midtransTransactionId,

            paymentType:
              payment.midtransPaymentType,

            transactionStatus:
              payment.midtransTransactionStatus,

            transactionTime:
              payment.midtransTransactionTime,

            qrCodeUrl,

            qrString,
          },
        },
      };
    } catch (error: any) {
      // ===================================================
      // JANGAN DOUBLE HANDLE BadRequestException
      // ===================================================

      if (
        error instanceof
        BadRequestException
      ) {
        throw error;
      }

      // ===================================================
      // UPDATE FAILED
      // ===================================================

      payment.status =
        PaymentStatus.FAILED;

      await this.paymentRepository.save(
        payment,
      );

      throw new BadRequestException(
        'Gagal terhubung ke Midtrans',
      );
    }
  }

  // =====================================================
  // GENERATE PAYMENT CODE
  // =====================================================

  private generatePaymentCode(): string {
    const date = new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        date.getDate(),
      ).padStart(2, '0');

    const random =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return `PAY-${year}${month}${day}-${random}`;
  }
}