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
  ) { }

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

  @Post('webhook/xendit')
  async xenditWebhook(@Body() payload: any) {
    return this.paymentsService.handleXenditWebhook(payload);
  }

  @Get('financial/vehicle-assignment/:vehicleAssignmentId')
  getFinancialByVehicleAssignment(
    @Param('vehicleAssignmentId')
    vehicleAssignmentId: string,
  ) {
    return this.paymentsService.getFinancialByVehicleAssignment(
      +vehicleAssignmentId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }
}