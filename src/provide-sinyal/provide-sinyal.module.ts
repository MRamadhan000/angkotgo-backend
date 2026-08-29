import { Module } from '@nestjs/common';
import { SinyalEntity } from './entities/provide-sinyal.entity';
import { SinyalDetailEntity } from './entities/provide-sinyal-detail.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SinyalController } from './sinyal.controller';
import { SinyalService } from './sinyal.service';

@Module({
  imports: [TypeOrmModule.forFeature([SinyalEntity, SinyalDetailEntity])],
  controllers: [SinyalController],
  providers: [SinyalService],
  exports: [SinyalService],
})
export class ProvideSinyalModule {}
