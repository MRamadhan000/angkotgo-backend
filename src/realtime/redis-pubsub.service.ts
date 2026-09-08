import {
    Injectable,
    Logger,
    OnModuleDestroy,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import Redis from 'ioredis';

type RedisMessageHandler = (payload: unknown) => void;

@Injectable()
export class RedisPubSubService implements OnModuleDestroy {
    private readonly logger = new Logger(
        RedisPubSubService.name,
    );

    private readonly publisher: Redis;
    private readonly subscriber: Redis;

    private readonly handlers = new Map<
        string,
        RedisMessageHandler[]
    >();

    constructor(configService: ConfigService) {
        const redisUrl =
            configService.get<string>('REDIS_URL') ??
            'redis://localhost:6379';

        /**
         * Redis Publisher
         *
         * Digunakan untuk:
         * - publish message
         * - set data
         * - get data
         * - delete data
         */
        this.publisher = new Redis(redisUrl);

        /**
         * Redis Subscriber
         *
         * Khusus untuk subscribe Pub/Sub.
         */
        this.subscriber = new Redis(redisUrl);

        /**
         * Publisher error
         */
        this.publisher.on('error', (error) => {
            this.logger.error(
                `Redis publisher error: ${error.message}`,
            );
        });

        /**
         * Subscriber error
         */
        this.subscriber.on('error', (error) => {
            this.logger.error(
                `Redis subscriber error: ${error.message}`,
            );
        });

        /**
         * Message listener dipasang SATU KALI.
         *
         * Jangan dipasang di dalam subscribe(),
         * karena subscribe() bisa dipanggil berkali-kali.
         */
        this.subscriber.on(
            'message',
            (messageChannel, message) => {
                const handlersForChannel =
                    this.handlers.get(messageChannel) ?? [];

                let payload: unknown;

                try {
                    payload = JSON.parse(message);
                } catch (error) {
                    this.logger.error(
                        `Failed to parse Redis message: ${message}`,
                    );

                    return;
                }

                handlersForChannel.forEach(
                    (registeredHandler) => {
                        registeredHandler(payload);
                    },
                );
            },
        );
    }

    /**
     * =========================================================
     * PUB / SUB
     * =========================================================
     */

    /**
     * Publish realtime event ke Redis channel.
     */
    async publish(
        channel: string,
        payload: unknown,
    ): Promise<void> {
        await this.publisher.publish(
            channel,
            JSON.stringify(payload),
        );
    }

    async ping(): Promise<void> {
        await this.publisher.ping();
    }

    /**
     * Subscribe ke Redis channel.
     */
    async subscribe(
        channel: string,
        handler: RedisMessageHandler,
    ): Promise<void> {
        const channelHandlers =
            this.handlers.get(channel) ?? [];

        channelHandlers.push(handler);

        this.handlers.set(
            channel,
            channelHandlers,
        );

        /**
         * Hanya subscribe Redis sekali
         * untuk channel yang sama.
         */
        if (channelHandlers.length === 1) {
            await this.subscriber.subscribe(channel);
        }
    }

    /**
     * =========================================================
     * KEY / VALUE
     * =========================================================
     */

    /**
     * Menyimpan data ke Redis.
     *
     * Contoh:
     *
     * await redisPubSub.set(
     *     'sinyal:latest:VA001',
     *     data,
     * );
     */
    async set(
        key: string,
        payload: unknown,
    ): Promise<void> {
        await this.publisher.set(
            key,
            JSON.stringify(payload),
        );
    }

    /**
     * Mengambil data dari Redis.
     *
     * Return null jika key tidak ditemukan.
     */
    async get<T>(
        key: string,
    ): Promise<T | null> {
        const data =
            await this.publisher.get(key);

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data) as T;
        } catch (error) {
            this.logger.error(
                `Failed to parse Redis data for key: ${key}`,
            );

            return null;
        }
    }

    /**
     * Menghapus data dari Redis.
     */
    async del(
        key: string,
    ): Promise<void> {
        await this.publisher.del(key);
    }

    async addToSet(
        key: string,
        value: string,
    ): Promise<void> {
        await this.publisher.sadd(key, value);
    }

    async removeFromSet(
        key: string,
        value: string,
    ): Promise<void> {
        await this.publisher.srem(key, value);
    }

    async getSetMembers(key: string): Promise<string[]> {
        return this.publisher.smembers(key);
    }

    /**
     * Mengecek apakah key tersedia.
     */
    async exists(
        key: string,
    ): Promise<boolean> {
        const result =
            await this.publisher.exists(key);

        return result === 1;
    }

    /**
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    async onModuleDestroy(): Promise<void> {
        await Promise.all([
            this.publisher.quit(),
            this.subscriber.quit(),
        ]);
    }
}