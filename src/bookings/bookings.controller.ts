import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';
//import { Trip } from './entities/booking.entity';
// import { UpdateTripDto } from './dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    return await this.bookingsService.create(createBookingDto);
  }

  @Get()
  async findAll(): Promise<Booking[]> {
    return await this.bookingsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Booking> {
    return await this.bookingsService.findOne(id);
  }

  // @Patch(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateTripDto: UpdateTripDto,
  // ) {
  //   return await this.tripsService.update(id, updateTripDto);
  // }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const deletedBooking = await this.bookingsService.remove(id);
    return { message: `Booking dengan ID ${id} berhasil dihapus` };
  }
}
