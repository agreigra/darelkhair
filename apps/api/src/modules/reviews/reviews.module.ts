import { Module } from '@nestjs/common';
import { BookingsModule } from '@/modules/bookings/bookings.module';
import {
  AdminReviewsController,
  FeaturedReviewsController,
  ReviewsController,
} from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './reviews.repository';

@Module({
  // BookingsModule exports BookingsService — used for the "confirmed stay" gate.
  imports: [BookingsModule],
  controllers: [
    FeaturedReviewsController,
    ReviewsController,
    AdminReviewsController,
  ],
  providers: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
