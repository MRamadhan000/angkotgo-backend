import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    const data = await this.reviewsService.create(createReviewDto);

    return {
      message: 'Review berhasil ditambahkan.',
      data,
    };
  }

  @Get('assignment/:vehicleAssignmentId')
  async findAllByVehicleAssignmentId(
    @Param('vehicleAssignmentId', ParseIntPipe)
    vehicleAssignmentId: number,
  ) {
    const data =
      await this.reviewsService.findAllByVehicleAssignmentId(
        vehicleAssignmentId,
      );

    return {
      message: 'Data review vehicle assignment berhasil diambil.',
      data,
    };
  }
}
