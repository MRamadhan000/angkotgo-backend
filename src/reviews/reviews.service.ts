import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  // ==========================================
  // POST REVIEW
  // ==========================================
 async create(
  createReviewDto: CreateReviewDto,
): Promise<Review> {
  const {
    userId,
    vehicleAssignmentId,
    rating,
    description,
  } = createReviewDto;

  const existingReview =
    await this.reviewRepository.findOne({
      where: {
        userId,
        vehicleAssignmentId,
      },
    });

  if (existingReview) {
    throw new ConflictException(
      'Anda sudah memberikan review untuk perjalanan ini.',
    );
  }

  const review = this.reviewRepository.create({
    userId,
    vehicleAssignmentId,
    rating,
    description: description ?? null,
  });

  return await this.reviewRepository.save(review);
}
  // ==========================================
  // GET ALL REVIEW BY USER ID
  // ==========================================
  async findAllByUserId(userId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: {
        userId,
      },
      relations: {
        user: true,
        vehicleAssignment: {
          vehicle: true,
          driver: true,
          route: true,
          conductor: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ==========================================
// GET ALL REVIEW BY VEHICLE ASSIGNMENT ID
// ==========================================
async findAllByVehicleAssignmentId(
  vehicleAssignmentId: number,
): Promise<Review[]> {
  return await this.reviewRepository.find({
    where: {
      vehicleAssignmentId,
    },
    relations: {
      user: true,
      vehicleAssignment: {
        vehicle: true,
        driver: true,
        route: true,
        conductor: true,
      },
    },
    order: {
      createdAt: 'DESC',
    },
  });
}
}