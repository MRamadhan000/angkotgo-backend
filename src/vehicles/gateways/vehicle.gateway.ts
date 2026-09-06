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

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class VehicleGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    // =========================
    // CLIENT CONNECT
    // =========================
    handleConnection(client: Socket) {
        console.log(`Vehicle socket connected: ${client.id}`);
    }

    // =========================
    // CLIENT DISCONNECT
    // =========================
    handleDisconnect(client: Socket) {
        console.log(`Vehicle socket disconnected: ${client.id}`);
    }

    // =========================
    // JOIN VEHICLE ASSIGNMENT
    // =========================
    @SubscribeMessage('vehicle:join')
    handleJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        data: { vehicleAssignmentId: number },
    ) {
        const room = `assignment:${data.vehicleAssignmentId}`;

        client.join(room);

        console.log(`${client.id} joined ${room}`);

        return {
            event: 'vehicle:joined',
            data: {
                vehicleAssignmentId: data.vehicleAssignmentId,
            },
        };
    }

    // =========================
    // BROADCAST LOCATION
    // =========================
    broadcastLocation(location: {
        vehicleAssignmentId: number;
        latitude: number;
        longitude: number;
        currentStopId?: number;
        stopStatus: string;
        createdAt: Date;
    }) {
        const room = `assignment:${location.vehicleAssignmentId}`;

        this.server.to(room).emit('vehicle:updated', {
            vehicleAssignmentId: location.vehicleAssignmentId,
            latitude: location.latitude,
            longitude: location.longitude,
            currentStopId: location.currentStopId,
            stopStatus: location.stopStatus,
            createdAt: location.createdAt,
        });
    }
}