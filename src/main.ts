import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { RedisPubSubService } from './realtime/redis-pubsub.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3001;

  await app.listen(port);

  logger.log(`Server running on http://localhost:${port}`);
  logger.log(
    `Socket.IO websocket ready at ws://localhost:${port}/socket.io/?EIO=4&transport=websocket`,
  );

  try {
    await app.get(RedisPubSubService).ping();
    logger.log('Berhasil connect ke Redis untuk websocket realtime');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Gagal connect ke Redis untuk websocket realtime: ${message}`);
  }
}

bootstrap();