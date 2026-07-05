import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveSessionsService } from './live-sessions.service';
import { LiveSessionsController } from './live-sessions.controller';
import { LiveSession } from './entities/live-session.entity';
import { LiveLocation } from './entities/live-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiveSession, LiveLocation])],
  controllers: [LiveSessionsController],
  providers: [LiveSessionsService],
})
export class LiveSessionsModule {}