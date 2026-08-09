import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entitiy';

@Module({ imports: [TypeOrmModule.forFeature([User])] })
export class UserModule {}
