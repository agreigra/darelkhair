import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { ReviewsService } from './reviews.service';
import { UpsertReviewDto } from './dto/upsert-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import type {
  ApartmentReviews,
  FeaturedReviewDto,
  MyReviewState,
  PaginatedAdminReviews,
  ReviewDto,
} from './types/review.types';

/** Public, cross-apartment review highlights (home page). */
@Controller('reviews')
export class FeaturedReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Public()
  @Get('featured')
  featured(): Promise<FeaturedReviewDto[]> {
    return this.reviews.featured();
  }
}

/** Reviews for a specific apartment (public list + guest authoring). */
@Controller('apartments/:apartmentId/reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Public()
  @Get()
  list(
    @Param('apartmentId') apartmentId: string,
    @Query() query: ReviewQueryDto,
  ): Promise<ApartmentReviews> {
    return this.reviews.listForApartment(apartmentId, query);
  }

  @Get('me')
  myReview(
    @Param('apartmentId') apartmentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<MyReviewState> {
    return this.reviews.myReview(apartmentId, userId);
  }

  @Post()
  upsert(
    @Param('apartmentId') apartmentId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpsertReviewDto,
    @Req() req: Request,
  ): Promise<ReviewDto> {
    return this.reviews.upsert(apartmentId, userId, dto, this.context(req));
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteMine(
    @Param('apartmentId') apartmentId: string,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.reviews.deleteMine(apartmentId, userId, this.context(req));
    return { success: true };
  }

  private context(req: Request): RequestContext {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}

/** Admin moderation of all reviews. */
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  list(@Query() query: ReviewQueryDto): Promise<PaginatedAdminReviews> {
    return this.reviews.adminList(query);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser('id') actorId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.reviews.adminDelete(id, actorId, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }
}
