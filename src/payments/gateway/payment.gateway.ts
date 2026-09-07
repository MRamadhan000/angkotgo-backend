import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisPubSubService } from '../../realtime/redis-pubsub.service';
import { PaymentStatus, PaymentType } from '../entities/payment.entity';

const PAYMENT_CHANNEL = 'payment:updated';

export interface PaymentRealtimePayload {
  paymentId: number;
  paymentCode: string;
  vehicleAssignmentId: number;
  userId: number;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PaymentGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(PaymentGateway.name);

  constructor(private readonly redisPubSub: RedisPubSubService) {}

  @WebSocketServer()
  server!: Server;

  async onModuleInit(): Promise<void> {
    await this.redisPubSub.subscribe(PAYMENT_CHANNEL, (payload) => {
      this.emitPayment(payload as PaymentRealtimePayload);
    });

    this.logger.log(
      `Berhasil connect ke Redis untuk payment gateway (${PAYMENT_CHANNEL})`,
    );
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Payment socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Payment socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('payment:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vehicleAssignmentId: number },
  ) {
    const vehicleAssignmentId = Number(data?.vehicleAssignmentId);

    if (!Number.isInteger(vehicleAssignmentId) || vehicleAssignmentId <= 0) {
      client.emit('payment:error', {
        message: 'vehicleAssignmentId wajib berupa angka positif',
      });
      return;
    }

    const room = this.getRoom(vehicleAssignmentId);
    await client.join(room);

    client.emit('payment:joined', {
      vehicleAssignmentId,
      room,
    });

    const latest = await this.redisPubSub.get<PaymentRealtimePayload>(
      this.getLatestKey(vehicleAssignmentId),
    );

    if (latest) {
      client.emit('payment:updated', latest);
    }
  }

  async broadcastPayment(payment: PaymentRealtimePayload): Promise<void> {
    await this.redisPubSub.set(
      this.getLatestKey(payment.vehicleAssignmentId),
      payment,
    );
    await this.redisPubSub.publish(PAYMENT_CHANNEL, payment);
  }

  private emitPayment(payment: PaymentRealtimePayload): void {
    this.server
      .to(this.getRoom(payment.vehicleAssignmentId))
      .emit('payment:updated', payment);
  }

  private getLatestKey(vehicleAssignmentId: number): string {
    return `payment:latest:${vehicleAssignmentId}`;
  }

  private getRoom(vehicleAssignmentId: number): string {
    return `payment:assignment:${vehicleAssignmentId}`;
  }
}