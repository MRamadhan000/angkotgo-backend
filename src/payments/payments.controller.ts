import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';

import { CreatePaymentDto } from './dto/create-payment.dto';

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
  // GET FINANCIAL
  // GET /payments/financial/vehicle-assignment/:vehicleAssignmentId
  // ==========================================

  @Get(
    'financial/vehicle-assignment/:vehicleAssignmentId',
  )
  getFinancialByVehicleAssignment(
    @Param('vehicleAssignmentId')
    vehicleAssignmentId: string,
  ) {
    return this.paymentsService.getFinancialByVehicleAssignment(
      +vehicleAssignmentId,
    );
  }
}