import {
    Logger,
} from '@nestjs/common';

import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';

import {
    Server,
    Socket,
} from 'socket.io';

import {
    RedisPubSubService,
} from '../../realtime/redis-pubsub.service';

const VEHICLE_LOCATION_CHANNEL =
    'vehicle:location';

interface VehicleLocationPayload {
    vehicleAssignmentId: number;
    latitude: number;
    longitude: number;
    currentStopId?: number;
    stopStatus: string;
    createdAt: Date;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class VehicleGateway
    implements
    OnGatewayConnection,
    OnGatewayDisconnect {
    private readonly logger =
        new Logger(VehicleGateway.name);

    constructor(
        private readonly redisPubSub: RedisPubSubService,
    ) { }

    @WebSocketServer()
    server!: Server;

    async onModuleInit(): Promise<void> {
        await this.redisPubSub.subscribe(
            VEHICLE_LOCATION_CHANNEL,
            (payload) => {
                this.emitLocation(
                    payload as VehicleLocationPayload,
                );
            },
        );

        this.logger.log(
            `Berhasil connect ke Redis untuk vehicle gateway (${VEHICLE_LOCATION_CHANNEL})`,
        );
    }

    handleConnection(client: Socket): void {
        this.logger.log(
            `Vehicle socket connected: ${client.id}`,
        );
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(
            `Vehicle socket disconnected: ${client.id}`,
        );
    }

    /**
     * =========================================================
     * JOIN VEHICLE ASSIGNMENT
     * =========================================================
     *
     * Client:
     *
     * vehicle:join
     *
     * {
     *     vehicleAssignmentId: 1
     * }
     *
     * Setelah join room, client akan langsung mendapatkan
     * lokasi terakhir dari Redis jika tersedia.
     */

    @SubscribeMessage('vehicle:join')
    @SubscribeMessage('vehicle:join')
    async handleJoin(
        @ConnectedSocket()
        client: Socket,

        @MessageBody()
        data: {
            vehicleAssignmentId: number;
        },
    ) {
        const {
            vehicleAssignmentId,
        } = data;

        const room =
            this.getRoom(vehicleAssignmentId);

        this.logger.log(
            `[Socket.IO] JOIN REQUEST client=${client.id} vehicleAssignmentId=${vehicleAssignmentId}`,
        );

        // Join room
        await client.join(room);

        this.logger.log(
            `[Socket.IO] JOINED client=${client.id} room=${room}`,
        );

        // ============================================
        // DEBUG ROOM MEMBERS
        // ============================================

        const clients =
            this.server.sockets.adapter.rooms.get(room);

        const clientIds =
            clients
                ? Array.from(clients)
                : [];

        this.logger.log(
            `[Socket.IO] room=${room} clientCount=${clientIds.length}`,
        );

        this.logger.log(
            `[Socket.IO] room=${room} clients=${JSON.stringify(clientIds)}`,
        );

        // ============================================
        // GET LATEST
        // ============================================

        const latest =
            await this.redisPubSub.get<VehicleLocationPayload>(
                this.getLatestKey(
                    vehicleAssignmentId,
                ),
            );

        if (latest) {

            this.logger.log(
                `[Socket.IO] Sending latest location to client=${client.id}`,
            );

            this.logger.log(
                `[Socket.IO] latest payload=${JSON.stringify(latest)}`,
            );

            client.emit(
                'vehicle:updated',
                latest,
            );
        }

        return {
            event: 'vehicle:joined',

            data: {
                vehicleAssignmentId,
            },
        };
    }

    /**
     * =========================================================
     * BROADCAST LOCATION
     * =========================================================
     *
     * Setiap lokasi baru:
     *
     * 1. ACTIVE → simpan latest location ke Redis
     * 2. Publish ke Redis Pub/Sub
     * 3. Gateway emit ke Socket.IO room
     */

    async broadcastLocation(
        location: VehicleLocationPayload,
    ): Promise<void> {
        /**
         * Simpan lokasi terakhir.
         */
        await this.redisPubSub.set(
            this.getLatestKey(
                location.vehicleAssignmentId,
            ),
            location,
        );

        /**
         * Publish realtime event.
         */
        await this.redisPubSub.publish(
            VEHICLE_LOCATION_CHANNEL,
            location,
        );
    }

    /**
     * =========================================================
     * EMIT LOCATION
     * =========================================================
     */

    private emitLocation(
        location: VehicleLocationPayload,
    ): void {
        const room =
            this.getRoom(
                location.vehicleAssignmentId,
            );

        const payload = {
            vehicleAssignmentId:
                location.vehicleAssignmentId,

            latitude:
                location.latitude,

            longitude:
                location.longitude,

            currentStopId:
                location.currentStopId,

            stopStatus:
                location.stopStatus,

            createdAt:
                location.createdAt,
        };

        // ============================================
        // DEBUG ROOM
        // ============================================

        const clients =
            this.server.sockets.adapter.rooms.get(room);

        const clientIds =
            clients
                ? Array.from(clients)
                : [];

        this.logger.log(
            `[Socket.IO] room=${room} clientCount=${clientIds.length}`,
        );

        this.logger.log(
            `[Socket.IO] room=${room} clients=${JSON.stringify(clientIds)}`,
        );

        // ============================================
        // DEBUG PAYLOAD
        // ============================================

        this.logger.log(
            `[Socket.IO] event=vehicle:updated room=${room} payload=${JSON.stringify(payload)}`,
        );

        // ============================================
        // EMIT
        // ============================================

        this.server
            .to(room)
            .emit(
                'vehicle:updated',
                payload,
            );
    }
    /**
     * =========================================================
     * REDIS KEY
     * =========================================================
     */

    private getLatestKey(
        vehicleAssignmentId: number,
    ): string {
        return `vehicle:latest:${vehicleAssignmentId}`;
    }

    /**
     * =========================================================
     * SOCKET.IO ROOM
     * =========================================================
     */

    private getRoom(
        vehicleAssignmentId: number,
    ): string {
        return `assignment:${vehicleAssignmentId}`;
    }
}