import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import { User } from 'src/user/entities/user.entitiy';
import {
  PaymentGateway,
  PaymentRealtimePayload,
} from './gateway/payment.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(VehicleAssignment)
    private readonly vehicleAssignmentRepository: Repository<VehicleAssignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paymentGateway: PaymentGateway,
  ) { }

  async create(createPaymentDto: CreatePaymentDto, userId: number) {
    const { vehicleAssignmentId, paymentType, amount } = createPaymentDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const vehicleAssignment = await this.vehicleAssignmentRepository.findOne({
      where: { id: vehicleAssignmentId },
    });

    if (!vehicleAssignment) {
      throw new NotFoundException('Vehicle assignment tidak ditemukan');
    }

    if (!amount || amount <= 0) {
      throw new BadRequestException('Nominal pembayaran harus lebih dari 0');
    }

    if (
      paymentType !== PaymentType.CASH &&
      paymentType !== PaymentType.ONLINE
    ) {
      throw new BadRequestException('Payment type tidak valid');
    }

    const payment = this.paymentRepository.create({
      paymentCode: this.generatePaymentCode(),
      vehicleAssignmentId,
      userId,
      paymentType,
      amount,

      status:
        paymentType === PaymentType.CASH
          ? PaymentStatus.PAID
          : PaymentStatus.PENDING,

      xenditPaymentRequestId: null,
      xenditReferenceId: null,
      xenditPaymentStatus: null,
      xenditChannelCode: null,
      xenditPaymentMethodId: null,
      xenditQrString: null,
      xenditPaidAt: null,
      xenditErrorCode: null,
      xenditErrorMessage: null,
      paidAt:
        paymentType === PaymentType.CASH
          ? new Date()
          : null,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    await this.paymentGateway.broadcastPayment(
      this.toRealtimePayload(savedPayment),
    );

    if (paymentType === PaymentType.CASH) {
      return {
        message: 'Pembayaran cash berhasil dibuat',
        data: {
          paymentId: savedPayment.id,
          paymentCode: savedPayment.paymentCode,
          vehicleAssignmentId: savedPayment.vehicleAssignmentId,
          userId: savedPayment.userId,
          paymentType: savedPayment.paymentType,
          amount: Number(savedPayment.amount),
          status: PaymentStatus.PAID,
        },
      };
    }

    return this.createXenditPayment(savedPayment);
  }

  async getHistoryByUserId(userId: number) {
    const payments = await this.paymentRepository.find({
      where: { userId },
      select: {
        paymentCode: true,
        amount: true,
        status: true,
        createdAt: true,
        xenditPaymentRequestId:true
      },
      order: {
        createdAt: 'DESC', // Urutkan transaksi terbaru di atas
      },
    });

    return {
      message: 'Berhasil mengambil riwayat pembayaran',
      data: payments,
    };
  }

  async findOne(id: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    return {
      message: 'Data payment berhasil diambil',
      data: {
        id: payment.id,
        paymentCode: payment.paymentCode,
        vehicleAssignmentId: payment.vehicleAssignmentId,
        userId: payment.userId,
        user: payment.user
          ? {
            id: payment.user.id,
            name: payment.user.name,
            email: payment.user.email,
          }
          : null,
        paymentType: payment.paymentType,
        amount: Number(payment.amount),
        status: payment.status,
        xendit: {
          paymentRequestId: payment.xenditPaymentRequestId,
          referenceId: payment.xenditReferenceId,
          paymentStatus: payment.xenditPaymentStatus,
          channelCode: payment.xenditChannelCode,
          paymentMethodId: payment.xenditPaymentMethodId,
          qrString: payment.xenditQrString,
          paidAt: payment.xenditPaidAt,
          errorCode: payment.xenditErrorCode,
          errorMessage: payment.xenditErrorMessage,
        },
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
    };
  }

  private async createXenditPayment(payment: Payment) {
    const secretKey = process.env.XENDIT_SECRET_KEY;

    if (!secretKey) {
      throw new BadRequestException('XENDIT_SECRET_KEY belum dikonfigurasi');
    }

    const referenceId = payment.paymentCode;

    try {
      const response = await fetch(
        'https://api.xendit.co/v3/payment_requests',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'api-version': '2024-11-11',
          },
          body: JSON.stringify({
            reference_id: referenceId,
            type: 'PAY',
            country: 'ID',
            currency: 'IDR',
            request_amount: Number(payment.amount),
            capture_method: 'AUTOMATIC',
            channel_code: 'QRIS',
          }),
        },
      );

      const xenditData = await response.json();

      if (!response.ok) {
        payment.status = PaymentStatus.FAILED;
        payment.xenditErrorCode = xenditData?.error_code ?? null;
        payment.xenditErrorMessage =
          xenditData?.message ?? JSON.stringify(xenditData);

        await this.paymentRepository.save(payment);

        throw new BadRequestException({
          message: 'Gagal membuat pembayaran Xendit',
          error: xenditData,
        });
      }

      const paymentRequestId = xenditData?.payment_request_id ?? null;

      if (!paymentRequestId) {
        payment.status = PaymentStatus.FAILED;
        payment.xenditErrorMessage =
          'Payment request ID tidak ditemukan dari Xendit';

        await this.paymentRepository.save(payment);

        throw new BadRequestException(
          'Xendit tidak mengembalikan payment request ID',
        );
      }

      const qrAction = xenditData?.actions?.find(
        (action: any) =>
          action?.descriptor === 'QR_STRING' ||
          action?.type === 'PRESENT_TO_CUSTOMER',
      );

      payment.xenditPaymentRequestId = paymentRequestId;
      payment.xenditReferenceId = xenditData?.reference_id ?? referenceId;
      payment.xenditPaymentStatus = xenditData?.status ?? 'PENDING';
      payment.xenditChannelCode = xenditData?.channel_code ?? 'QRIS';
      payment.xenditQrString = qrAction?.value ?? null;

      await this.paymentRepository.save(payment);

      return {
        message: 'Pembayaran QRIS berhasil dibuat',
        data: {
          paymentId: payment.id,
          paymentCode: payment.paymentCode,
          vehicleAssignmentId: payment.vehicleAssignmentId,
          userId: payment.userId,
          amount: Number(payment.amount),
          paymentType: payment.paymentType,
          status: payment.status,
          xendit: {
            paymentRequestId: payment.xenditPaymentRequestId,
            referenceId: payment.xenditReferenceId,
            status: payment.xenditPaymentStatus,
            channelCode: payment.xenditChannelCode,
            qrString: payment.xenditQrString,
          },
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      payment.status = PaymentStatus.FAILED;
      payment.xenditErrorMessage = error?.message ?? 'Unknown Xendit error';

      await this.paymentRepository.save(payment);

      throw new BadRequestException('Gagal terhubung ke Xendit');
    }
  }

  async getFinancialByVehicleAssignment(vehicleAssignmentId: number) {
    const vehicleAssignment = await this.vehicleAssignmentRepository.findOne({
      where: { id: vehicleAssignmentId },
    });

    if (!vehicleAssignment) {
      throw new NotFoundException('Vehicle assignment tidak ditemukan');
    }

    const payments = await this.paymentRepository.find({
      where: { vehicleAssignmentId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    const paidPayments = payments.filter(
      (p) => p.status === PaymentStatus.PAID,
    );

    const pendingPayments = payments.filter(
      (p) => p.status === PaymentStatus.PENDING,
    );

    const failedPayments = payments.filter(
      (p) => p.status === PaymentStatus.FAILED,
    );

    const cancelledPayments = payments.filter(
      (p) => p.status === PaymentStatus.CANCELLED,
    );

    const total = (items: Payment[]) =>
      items.reduce((sum, p) => sum + Number(p.amount), 0);

    const cashPayments = paidPayments.filter(
      (p) => p.paymentType === PaymentType.CASH,
    );

    const onlinePayments = paidPayments.filter(
      (p) => p.paymentType === PaymentType.ONLINE,
    );

    return {
      message: 'Data keuangan berhasil diambil',
      data: {
        vehicleAssignmentId,
        summary: {
          totalTransactions: payments.length,
          totalPaidTransactions: paidPayments.length,
          totalPendingTransactions: pendingPayments.length,
          totalFailedTransactions: failedPayments.length,
          totalCancelledTransactions: cancelledPayments.length,
          totalPaid: total(paidPayments),
          totalPending: total(pendingPayments),
          totalCash: total(cashPayments),
          totalOnline: total(onlinePayments),
        },
        payments: payments.map((payment) => ({
          id: payment.id,
          paymentCode: payment.paymentCode,
          userId: payment.userId,
          user: payment.user
            ? {
              id: payment.user.id,
              name: payment.user.name,
              email: payment.user.email,
            }
            : null,
          paymentType: payment.paymentType,
          amount: Number(payment.amount),
          status: payment.status,
          xendit: {
            paymentRequestId: payment.xenditPaymentRequestId,
            referenceId: payment.xenditReferenceId,
            paymentStatus: payment.xenditPaymentStatus,
            channelCode: payment.xenditChannelCode,
            paymentMethodId: payment.xenditPaymentMethodId,
            qrString: payment.xenditQrString,
            paidAt: payment.xenditPaidAt,
            errorCode: payment.xenditErrorCode,
            errorMessage: payment.xenditErrorMessage,
          },
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        })),
      },
    };
  }

  private generatePaymentCode(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `PAY-${year}${month}${day}-${random}`;
  }

  async handleXenditWebhook(payload: any) {
    const paymentRequestId = payload?.payment_request_id;

    if (!paymentRequestId) {
      throw new BadRequestException('Payment request ID tidak ditemukan');
    }

    const payment = await this.paymentRepository.findOne({
      where: {
        xenditPaymentRequestId: paymentRequestId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    const xenditStatus = payload?.status;

    if (xenditStatus === 'SUCCEEDED') {
      payment.status = PaymentStatus.PAID;

      payment.xenditPaymentStatus = xenditStatus;

      payment.xenditPaidAt = payload?.created ?? new Date();

      payment.paidAt = payment.xenditPaidAt;

      await this.paymentRepository.save(payment);
      await this.paymentGateway.broadcastPayment(
        this.toRealtimePayload(payment),
      );

      await this.paymentGateway.broadcastPayment(
        this.toRealtimePayload(payment),
      );
    }

    return {
      message: 'Webhook berhasil diproses',
    };
  }

  private toRealtimePayload(payment: Payment): PaymentRealtimePayload {
    return {
      paymentId: payment.id,
      paymentCode: payment.paymentCode,
      vehicleAssignmentId: payment.vehicleAssignmentId,
      userId: payment.userId,
      paymentType: payment.paymentType,
      amount: Number(payment.amount),
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
