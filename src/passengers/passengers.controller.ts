// import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
// import { PassengerService } from './passengers.service';

// @Controller('api/passenger')
// export class PassengerController {
//   constructor(private readonly passengerService: PassengerService) {}

//   // 1. API Mencari Nama Halte (Auto-complete / Dropdown)
//   @Get('stops')
//   async searchStops(@Query('search') search: string) {
//     if (!search) {
//       throw new HttpException('Query pencarian tidak boleh kosong', HttpStatus.BAD_REQUEST);
//     }
//     const stops = await this.passengerService.searchStopsByName(search);
//     return {
//       status: 'success',
//       data: stops,
//     };
//   }

//   // 2. API Utama Mencari Jalur & Bus Aktif (Searah)
//   @Post('find-bus')
//   async findBus(
//     @Body('origin_stop_id') originStopId: number,
//     @Body('destination_stop_id') destinationStopId: number,
//   ) {
//     if (!originStopId || !destinationStopId) {
//       throw new HttpException('ID halte asal dan tujuan wajib diisi', HttpStatus.BAD_REQUEST);
//     }

//     try {
//       const searchResult = await this.passengerService.findRouteAndActiveBuses(
//         originStopId,
//         destinationStopId,
//       );
//       return {
//         status: 'success',
//         data: searchResult,
//       };
//     } catch (error : any) {
//       throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
//     }
//   }
// }
