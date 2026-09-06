import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';

import { Logger } from '@nestjs/common';
import {
    Server,
    Socket,
} from 'socket.io';

import {
    RedisPubSubService,
} from '../../realtime/redis-pubsub.service';

const SINYAL_CHANNEL = 'sinyal:updated';
export type SinyalStatusRealtime = | 'ACTIVE' | 'COMPLETED';
export interface SinyalRealtimePayload {
    sinyalId: string;
    vehicleAssignmentId: string;
    latitude: number;
    longitude: number;
    status: SinyalStatusRealtime;
}


@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SinyalGateway
    implements
    OnGatewayConnection,
    OnGatewayDisconnect {

    private readonly logger =
        new Logger(SinyalGateway.name);
    constructor(
        private readonly redisPubSub: RedisPubSubService,
    ) { }

    @WebSocketServer()
    server!: Server;
    async onModuleInit(): Promise<void> {

        await this.redisPubSub.subscribe(
            SINYAL_CHANNEL,
            (payload) => {

                this.logger.log(
                    `[Redis] Received channel=${SINYAL_CHANNEL} payload=${JSON.stringify(payload)}`,
                );

                this.emitSinyal(
                    payload as SinyalRealtimePayload,
                );
            },
        );


        this.logger.log(
            `Berhasil connect ke Redis untuk sinyal gateway (${SINYAL_CHANNEL})`,
        );
    }

    handleConnection(
        client: Socket,
    ): void {

        this.logger.log(
            `Sinyal socket connected: ${client.id}`,
        );

        this.logger.log(
            `[Socket.IO] namespace=${client.nsp.name}`,
        );

        this.logger.log(
            `[Socket.IO] transport=${client.conn.transport.name}`,
        );
    }


    handleDisconnect(
        client: Socket,
    ): void {

        this.logger.log(
            `Sinyal socket disconnected: ${client.id}`,
        );

        this.logger.log(
            `[Socket.IO] disconnect reason=${client.disconnected}`,
        );
    }


    /**
     * =========================================================
     * JOIN ASSIGNMENT ROOM
     * =========================================================
     *
     * Client join berdasarkan vehicleAssignmentId.
     *
     * Flow:
     *
     * Client
     *    ↓
     * sinyal:join
     *    ↓
     * join room
     *    ↓
     * cek Redis latest state
     *    ↓
     * jika ada → kirim sinyal:updated
     */

    @SubscribeMessage('sinyal:join')
    async handleJoin(

        @ConnectedSocket()
        client: Socket,

        @MessageBody()
        data: {
            vehicleAssignmentId: string;
        },

    ) {

        const {
            vehicleAssignmentId,
        } = data;

        this.logger.log(
            `[Socket.IO] JOIN REQUEST client=${client.id} vehicleAssignmentId=${vehicleAssignmentId}`,
        );

        if (!vehicleAssignmentId) {

            this.logger.warn(
                `[Socket.IO] JOIN FAILED client=${client.id} vehicleAssignmentId kosong`,
            );

            client.emit(
                'sinyal:error',
                {
                    message:
                        'vehicleAssignmentId wajib diisi',
                },
            );

            return;
        }

        const room =
            this.getRoom(
                vehicleAssignmentId,
            );

        await client.join(room);


        this.logger.log(
            `[Socket.IO] JOINED client=${client.id} room=${room}`,
        );

        const clients =
            this.server.sockets.adapter.rooms.get(
                room,
            );

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

        this.logger.log(
            `[Socket.IO] client=${client.id} rooms=${JSON.stringify(
                Array.from(client.rooms),
            )}`,
        );


        /**
         * -----------------------------------------------------
         * EMIT JOINED
         * -----------------------------------------------------
         *
         * Kita emit secara eksplisit supaya lebih mudah
         * dites dari Postman / HTML / frontend.
         */

        client.emit(
            'sinyal:joined',
            {
                vehicleAssignmentId,
                room,
            },
        );


        /**
         * -----------------------------------------------------
         * GET LATEST STATE FROM REDIS
         * -----------------------------------------------------
         */

        const assignmentIndexKey =
            this.getAssignmentIndexKey(vehicleAssignmentId);

        const signalIds = await this.redisPubSub.getSetMembers(
            assignmentIndexKey,
        );

        this.logger.log(
            `[Redis] GROUP assignment=${vehicleAssignmentId} indexKey=${assignmentIndexKey} signalIds=${JSON.stringify(signalIds)}`,
        );

        const latestSignals = (
            await Promise.all(
                signalIds.map(async (sinyalId) => {
                    const latestKey = this.getLatestKey(sinyalId);
                    const signal =
                        await this.redisPubSub.get<SinyalRealtimePayload>(
                            latestKey,
                        );

                    this.logger.log(
                        `[Redis] GROUP assignment=${vehicleAssignmentId} key=${latestKey} payload=${JSON.stringify(signal)}`,
                    );

                    return signal;
                }),
            )
        ).filter((signal): signal is SinyalRealtimePayload => signal !== null);


        /**
         * -----------------------------------------------------
         * DEBUG REDIS LATEST
         * -----------------------------------------------------
         */

        if (latestSignals.length > 0) {

            this.logger.log(
                `[Redis] ${latestSignals.length} sinyal ditemukan assignment=${vehicleAssignmentId}`,
            );

            this.logger.log(
                `[Redis] Latest payload=${JSON.stringify(latestSignals)}`,
            );

        } else {

            this.logger.log(
                `[Redis] Sinyal tidak ditemukan assignment=${vehicleAssignmentId}`,
            );
        }


        /**
         * -----------------------------------------------------
         * SEND LATEST STATE TO NEW CLIENT
         * -----------------------------------------------------
         */

        for (const latest of latestSignals) {

            client.emit(
                'sinyal:updated',
                latest,
            );


            this.logger.log(
                `[Socket.IO] event=sinyal:updated target=${client.id} payload=${JSON.stringify(
                    latest,
                )}`,
            );
        }


        /**
         * -----------------------------------------------------
         * RETURN ACK
         * -----------------------------------------------------
         */

        return {
            event: 'sinyal:joined',

            data: {
                vehicleAssignmentId,
                room,
            },
        };
    }


    /**
     * =========================================================
     * BROADCAST SINYAL
     * =========================================================
     *
     * Dipanggil ketika terjadi update sinyal.
     *
     * ACTIVE:
     *    Redis SET latest
     *    Redis PUBLISH
     *
     * COMPLETED:
     *    Redis DEL latest
     *    Redis PUBLISH
     */

    async broadcastSinyal(
        data: SinyalRealtimePayload,
    ): Promise<void> {

        const key = this.getLatestKey(data.sinyalId);
        const assignmentIndexKey = this.getAssignmentIndexKey(
            data.vehicleAssignmentId,
        );


        /**
         * -----------------------------------------------------
         * DEBUG BROADCAST
         * -----------------------------------------------------
         */

        this.logger.log(
            `[Broadcast] sinyalId=${data.sinyalId} vehicleAssignmentId=${data.vehicleAssignmentId} status=${data.status}`,
        );

        this.logger.log(
            `[Broadcast] payload=${JSON.stringify(data)}`,
        );


        /**
         * =====================================================
         * COMPLETED
         * =====================================================
         */

        if (
            data.status === 'COMPLETED'
        ) {

            await this.redisPubSub.del(
                key,
            );
            await this.redisPubSub.removeFromSet(
                assignmentIndexKey,
                data.sinyalId,
            );


            this.logger.log(
                `[Redis] DELETE latest key=${key}`,
            );

        } else {

            /**
             * =================================================
             * ACTIVE
             * =================================================
             */

            await this.redisPubSub.set(
                key,
                data,
            );
            await this.redisPubSub.addToSet(
                assignmentIndexKey,
                data.sinyalId,
            );


            this.logger.log(
                `[Redis] SET latest key=${key}`,
            );
        }

        await this.logAssignmentKeys(
            data.vehicleAssignmentId,
        );


        /**
         * =====================================================
         * REDIS PUBLISH
         * =====================================================
         */

        await this.redisPubSub.publish(
            SINYAL_CHANNEL,
            data,
        );


        this.logger.log(
            `[Redis] PUBLISH channel=${SINYAL_CHANNEL}`,
        );
    }


    /**
     * =========================================================
     * EMIT TO SOCKET.IO ROOM
     * =========================================================
     */

    private emitSinyal(
        data: SinyalRealtimePayload,
    ): void {

        const room =
            this.getRoom(
                data.vehicleAssignmentId,
            );


        /**
         * -----------------------------------------------------
         * CHECK ROOM MEMBERS
         * -----------------------------------------------------
         */

        const clients =
            this.server.sockets.adapter.rooms.get(
                room,
            );

        const clientIds =
            clients
                ? Array.from(clients)
                : [];


        /**
         * -----------------------------------------------------
         * DEBUG ROOM
         * -----------------------------------------------------
         */

        this.logger.log(
            `[Socket.IO] room=${room} clientCount=${clientIds.length}`,
        );

        this.logger.log(
            `[Socket.IO] room=${room} clients=${JSON.stringify(
                clientIds,
            )}`,
        );


        /**
         * -----------------------------------------------------
         * DEBUG PAYLOAD
         * -----------------------------------------------------
         */

        this.logger.log(
            `[Socket.IO] event=sinyal:updated room=${room} payload=${JSON.stringify(
                data,
            )}`,
        );


        /**
         * -----------------------------------------------------
         * EMIT
         * -----------------------------------------------------
         */

        this.server
            .to(room)
            .emit(
                'sinyal:updated',
                data,
            );


        this.logger.log(
            `[Socket.IO] EMIT SUCCESS event=sinyal:updated room=${room}`,
        );
    }


    /**
     * =========================================================
     * REDIS KEY
     * =========================================================
     */

    private getLatestKey(
        sinyalId: string,
    ): string {

        return `sinyal:latest:${sinyalId}`;
    }

    private getAssignmentIndexKey(
        vehicleAssignmentId: string,
    ): string {
        return `sinyal:assignment:${vehicleAssignmentId}:ids`;
    }

    private async logAssignmentKeys(
        vehicleAssignmentId: string,
    ): Promise<void> {
        const indexKey = this.getAssignmentIndexKey(
            vehicleAssignmentId,
        );
        const signalIds = await this.redisPubSub.getSetMembers(
            indexKey,
        );

        this.logger.log(
            `[Redis] GROUP assignment=${vehicleAssignmentId} indexKey=${indexKey} signalIds=${JSON.stringify(signalIds)}`,
        );

        for (const sinyalId of signalIds) {
            const latestKey = this.getLatestKey(sinyalId);
            const payload =
                await this.redisPubSub.get<SinyalRealtimePayload>(
                    latestKey,
                );

            this.logger.log(
                `[Redis] GROUP assignment=${vehicleAssignmentId} key=${latestKey} payload=${JSON.stringify(payload)}`,
            );
        }
    }


    /**
     * =========================================================
     * SOCKET ROOM
     * =========================================================
     */

    private getRoom(
        vehicleAssignmentId: string,
    ): string {

        return `sinyal:assignment:${vehicleAssignmentId}`;
    }
}