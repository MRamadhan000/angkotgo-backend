import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';

import { CreatePaymentDto } from './dto/create-payment.dto';

import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  // ==========================================
  // CREATE PAYMENT
  // POST /payments/:userId
  // ==========================================

  @Post(':userId')
  create(
    @Param('userId') userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(
      createPaymentDto,
      +userId,
    );
  }

  // ==========================================
  // GET ALL PAYMENTS
  // ==========================================

  // @Get()
  // findAll() {
  //   return this.paymentsService.findAll();
  // }

  // ==========================================
  // GET PAYMENT
  // ==========================================

  // @Get(':id')
  // findOne(
  //   @Param('id') id: string,
  // ) {
  //   return this.paymentsService.findOne(+id);
  // }

  // ==========================================
  // UPDATE PAYMENT
  // ==========================================

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePaymentDto: UpdatePaymentDto,
  // ) {
  //   return this.paymentsService.update(
  //     +id,
  //     updatePaymentDto,
  //   );
  // }

  // ==========================================
  // DELETE PAYMENT
  // ==========================================

  // @Delete(':id')
  // remove(
  //   @Param('id') id: string,
  // ) {
  //   return this.paymentsService.remove(+id);
  // }
}