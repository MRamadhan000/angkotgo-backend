import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserStatus } from '../entities/user.entitiy';
import { UsersService } from '../services/users.service';
import { LoginUserDto } from '../dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return { message: 'User berhasil dibuat.', data };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const data = await this.usersService.login(loginUserDto);

    return {
      message: 'Login berhasil.',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.usersService.findAll();
    return { message: 'Berhasil mengambil semua user.', data };
  }

  @Get('deleted')
  async findDeleted() {
    const data = await this.usersService.findDeleted();
    return { message: 'Berhasil mengambil user yang dihapus.', data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usersService.findOne(id);
    return { message: 'Berhasil mengambil data user.', data };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.usersService.update(id, updateUserDto);
    return { message: 'User berhasil diperbarui.', data };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: UserStatus,
  ) {
    const data = await this.usersService.updateStatus(id, status);
    return { message: 'Status user berhasil diperbarui.', data };
  }

  @Patch(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usersService.activate(id);
    return { message: 'User berhasil diaktifkan.', data };
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usersService.deactivate(id);
    return { message: 'User berhasil dinonaktifkan.', data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.remove(id);
    return { message: result.message };
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.restore(id);
    return { message: result.message };
  }
}