import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from './entities/conductor.entity';
import { ConductorsService } from './conductors.service';
import { ConductorsController } from './conductors.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conductor])
  ],
  controllers: [ConductorsController],
  providers: [ConductorsService],
  exports: [ConductorsService],
})
export class ConductorsModule {}