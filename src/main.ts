// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aktifkan validasi global di sini
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Otomatis menghapus properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // lapor error jika client mengirim properti asing
      transform: true, // Otomatis mengubah tipe data request sesuai tipe data di DTO
    }),
  );

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
