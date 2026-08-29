import {
    Injectable,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { User, UserStatus } from '../entities/user.entitiy';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });

        if (existingUser) {
            throw new ConflictException('Email sudah digunakan');
        }

        const user = this.userRepository.create({
            ...createUserDto,
            status: UserStatus.PENDING,
        });

        return await this.userRepository.save(user);
    }

    async login(loginUserDto: LoginUserDto): Promise<User> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', {
                email: loginUserDto.email,
            })
            .getOne();

        if (!user) {
            throw new UnauthorizedException(
                'Email atau password salah',
            );
        }

        const isPasswordValid = await bcrypt.compare(
            loginUserDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Email atau password salah',
            );
        }

        if (user.status === UserStatus.PENDING) {
            throw new UnauthorizedException(
                'Akun masih menunggu persetujuan',
            );
        }

        if (user.status === UserStatus.DEACTIVE) {
            throw new UnauthorizedException(
                'Akun sedang dinonaktifkan',
            );
        }

        return user;
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            order: { id: 'DESC' },
        });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
        }

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        Object.assign(user, updateUserDto);

        return await this.userRepository.save(user);
    }

    async updateStatus(id: number, status: UserStatus): Promise<User> {
        const user = await this.findOne(id);

        user.status = status;

        return await this.userRepository.save(user);
    }

    async activate(id: number): Promise<User> {
        const user = await this.findOne(id);

        user.status = UserStatus.ACTIVE;

        return await this.userRepository.save(user);
    }

    async deactivate(id: number): Promise<User> {
        const user = await this.findOne(id);

        user.status = UserStatus.DEACTIVE;

        return await this.userRepository.save(user);
    }

    async remove(id: number): Promise<{ message: string }> {
        const user = await this.findOne(id);

        await this.userRepository.softDelete(user.id);

        return {
            message: `User dengan ID ${id} berhasil dihapus.`,
        };
    }

    async restore(id: number): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: true,
        });

        if (!user) {
            throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
        }

        await this.userRepository.restore(id);

        return {
            message: `User dengan ID ${id} berhasil dipulihkan.`,
        };
    }

    async findDeleted(): Promise<User[]> {
        return await this.userRepository.find({
            withDeleted: true,
            where: { deletedAt: Not(IsNull()) },
            order: { id: 'DESC' },
        });
    }
}