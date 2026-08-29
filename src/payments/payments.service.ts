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

    // ===================================================
    // 1. CEK VEHICLE ASSIGNMENT
    // ===================================================

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

    // ===================================================
    // 2. VALIDASI NOMINAL
    // ===================================================

    if (!amount || amount <= 0) {
      throw new BadRequestException(
        'Nominal pembayaran harus lebih dari 0',
      );
    }

    // ===================================================
    // 3. VALIDASI PAYMENT TYPE
    // ===================================================

    if (
      paymentType !== PaymentType.CASH &&
      paymentType !== PaymentType.ONLINE
    ) {
      throw new BadRequestException(
        'Payment type tidak valid',
      );
    }

    // ===================================================
    // 4. GENERATE PAYMENT CODE
    // ===================================================

    const paymentCode =
      this.generatePaymentCode();

    // ===================================================
    // 5. BUAT PAYMENT
    // ===================================================

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

    // ===================================================
    // 6. CASH
    // ===================================================

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
            Number(savedPayment.amount),

          status:
            savedPayment.status,
        },
      };
    }

    // ===================================================
    // 7. ONLINE / QRIS
    // ===================================================

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
      // =================================================
      // BASIC AUTH
      // =================================================

      const auth =
        Buffer
          .from(`${serverKey}:`)
          .toString('base64');

      // =================================================
      // WEBHOOK URL
      // =================================================

      const notificationUrl =
        process.env.MIDTRANS_NOTIFICATION_URL;

      // =================================================
      // REQUEST KE MIDTRANS
      // =================================================

      const response =
        await fetch(
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
                order_id:
                  orderId,

                gross_amount:
                  Number(
                    payment.amount,
                  ),
              },

              qris: {
                acquirer: 'gopay',
              },
            }),
          },
        );

      // =================================================
      // PARSE RESPONSE MIDTRANS
      // =================================================

      const midtransData =
        await response.json();

      // =================================================
      // CEK RESPONSE
      // =================================================

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

      // =================================================
      // QR CODE URL
      // =================================================

      const qrCodeUrl =
        midtransData.actions?.find(
          (action: any) =>
            action.name ===
            'generate-qr-code',
        )?.url ?? null;

      // =================================================
      // QR STRING
      // =================================================

      const qrString =
        midtransData.qr_string ??
        null;

      // =================================================
      // VALIDASI QRIS
      // =================================================

      if (
        !qrCodeUrl &&
        !qrString
      ) {
        payment.status =
          PaymentStatus.FAILED;

        await this.paymentRepository.save(
          payment,
        );

        throw new BadRequestException(
          'QRIS berhasil dibuat tetapi data QR tidak ditemukan',
        );
      }

      // =================================================
      // SIMPAN DATA MIDTRANS
      // =================================================

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

      // =================================================
      // RETURN KE FRONTEND
      // =================================================

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

          userId:
            payment.userId,

          amount:
            Number(payment.amount),

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
      // =================================================
      // JANGAN DOUBLE HANDLE
      // =================================================

      if (
        error instanceof
        BadRequestException
      ) {
        throw error;
      }

      // =================================================
      // UPDATE PAYMENT FAILED
      // =================================================

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
  // GET FINANCIAL BY VEHICLE ASSIGNMENT
  // =====================================================

  async getFinancialByVehicleAssignment(
    vehicleAssignmentId: number,
  ) {
    // ===================================================
    // 1. CEK VEHICLE ASSIGNMENT
    // ===================================================

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

    // ===================================================
    // 2. AMBIL SEMUA PAYMENT
    // ===================================================

    const payments =
      await this.paymentRepository.find({
        where: {
          vehicleAssignmentId,
        },

        relations: {
          user: true,
        },

        order: {
          createdAt: 'DESC',
        },
      });

    // ===================================================
    // 3. FILTER BERDASARKAN STATUS
    // ===================================================

    const paidPayments =
      payments.filter(
        (payment) =>
          payment.status ===
          PaymentStatus.PAID,
      );

    const pendingPayments =
      payments.filter(
        (payment) =>
          payment.status ===
          PaymentStatus.PENDING,
      );

    const failedPayments =
      payments.filter(
        (payment) =>
          payment.status ===
          PaymentStatus.FAILED,
      );

    const cancelledPayments =
      payments.filter(
        (payment) =>
          payment.status ===
          PaymentStatus.CANCELLED,
      );

    // ===================================================
    // 4. TOTAL PAID
    // ===================================================

    const totalPaid =
      paidPayments.reduce(
        (total, payment) =>
          total +
          Number(payment.amount),
        0,
      );

    // ===================================================
    // 5. TOTAL PENDING
    // ===================================================

    const totalPending =
      pendingPayments.reduce(
        (total, payment) =>
          total +
          Number(payment.amount),
        0,
      );

    // ===================================================
    // 6. TOTAL CASH
    // ===================================================

    const cashPayments =
      paidPayments.filter(
        (payment) =>
          payment.paymentType ===
          PaymentType.CASH,
      );

    const totalCash =
      cashPayments.reduce(
        (total, payment) =>
          total +
          Number(payment.amount),
        0,
      );

    // ===================================================
    // 7. TOTAL ONLINE
    // ===================================================

    const onlinePayments =
      paidPayments.filter(
        (payment) =>
          payment.paymentType ===
          PaymentType.ONLINE,
      );

    const totalOnline =
      onlinePayments.reduce(
        (total, payment) =>
          total +
          Number(payment.amount),
        0,
      );

    // ===================================================
    // 8. RETURN DATA
    // ===================================================

    return {
      message:
        'Data keuangan berhasil diambil',

      data: {
        vehicleAssignmentId,

        summary: {
          totalTransactions:
            payments.length,

          totalPaidTransactions:
            paidPayments.length,

          totalPendingTransactions:
            pendingPayments.length,

          totalFailedTransactions:
            failedPayments.length,

          totalCancelledTransactions:
            cancelledPayments.length,

          totalPaid,

          totalPending,

          totalCash,

          totalOnline,
        },

        payments:
          payments.map(
            (payment) => ({
              id:
                payment.id,

              paymentCode:
                payment.paymentCode,

              userId:
                payment.userId,

              user:
                payment.user
                  ? {
                      id:
                        payment.user.id,

                      name:
                        payment.user.name,

                      email:
                        payment.user.email,
                    }
                  : null,

              paymentType:
                payment.paymentType,

              amount:
                Number(
                  payment.amount,
                ),

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

                settlementTime:
                  payment.midtransSettlementTime,
              },

              paidAt:
                payment.paidAt,

              createdAt:
                payment.createdAt,

              updatedAt:
                payment.updatedAt,
            }),
          ),
      },
    };
  }

  // =====================================================
  // GENERATE PAYMENT CODE
  // =====================================================

  private generatePaymentCode(): string {
    const date =
      new Date();

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