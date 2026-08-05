import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ConductorsService } from './conductors.service';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import { LoginConductorDto } from './dto/login-conductor.dto';

@Controller('conductors')
export class ConductorsController {
  constructor(private readonly conductorsService: ConductorsService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginConductorDto) {
    return await this.conductorsService.login(loginDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateConductorDto) {
    const data = await this.conductorsService.create(createDto);
    return {
      message: 'Kondektur berhasil ditambahkan.',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.conductorsService.findAll();
    return {
      message: 'Berhasil mengambil daftar kondektur.',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.conductorsService.findOne(id);
    return {
      message: `Berhasil mengambil data kondektur ID ${id}.`,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateConductorDto,
  ) {
    const data = await this.conductorsService.update(id, updateDto);
    return {
      message: `Data kondektur ID ${id} berhasil diperbarui.`,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.conductorsService.remove(id);
  }
}