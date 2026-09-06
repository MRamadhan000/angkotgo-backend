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

export type SinyalStatusRealtime =
    'ACTIVE' | 'COMPLETED';

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
    @WebSocketServer()
    server!: Server;

    handleConnection(client: Socket) {
        console.log(
            `Sinyal socket connected: ${client.id}`,
        );
    }

    handleDisconnect(client: Socket) {
        console.log(
            `Sinyal socket disconnected: ${client.id}`,
        );
    }

    /**
     * Driver subscribe berdasarkan
     * vehicleAssignmentId
     */
    @SubscribeMessage('sinyal:join')
    handleJoin(
        @ConnectedSocket() client: Socket,

        @MessageBody()
        data: {
            vehicleAssignmentId: string;
        },
    ) {
        const room =
            `sinyal:assignment:${data.vehicleAssignmentId}`;

        client.join(room);

        console.log(
            `${client.id} joined ${room}`,
        );

        return {
            event: 'sinyal:joined',

            data: {
                vehicleAssignmentId:
                    data.vehicleAssignmentId,
            },
        };
    }

    /**
     * Broadcast sinyal ke assignment tertentu
     */
    broadcastSinyal(
        data: SinyalRealtimePayload,
    ) {
        const room =
            `sinyal:assignment:${data.vehicleAssignmentId}`;

        this.server
            .to(room)
            .emit(
                'sinyal:updated',
                data,
            );
    }
}