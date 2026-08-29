import { Module } from '@nestjs/common';
import { CostsService } from './costs.service';
import { CostsController } from './costs.controller';
import { Cost } from './entities/cost';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Cost])],
  controllers: [CostsController],
  providers: [CostsService],
})
export class CostsModule {}
