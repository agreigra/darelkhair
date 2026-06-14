import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '@/common/audit/audit.service';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { BookingsService } from '@/modules/bookings/bookings.service';
import {
  ReviewsRepository,
  type AdminReviewRow,
  type ReviewWithAuthor,
} from './reviews.repository';
import { UpsertReviewDto } from './dto/upsert-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import type {
  AdminReviewDto,
  ApartmentReviews,
  MyReviewState,
  PaginatedAdminReviews,
  ReviewDto,
  ReviewSummary,
} from './types/review.types';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly repo: ReviewsRepository,
    private readonly bookings: BookingsService,
    private readonly audit: AuditService,
  ) {}

  // ── public ──

  async listForApartment(
    apartmentId: string,
    query: ReviewQueryDto,
  ): Promise<ApartmentReviews> {
    const [{ items, total }, summary] = await Promise.all([
      this.repo.listForApartment({
        apartmentId,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.repo.summary(apartmentId),
    ]);
    return {
      summary: this.toSummary(summary),
      items: items.map((r) => this.toDto(r)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  // ── guest ──

  async myReview(apartmentId: string, userId: string): Promise<MyReviewState> {
    const [existing, eligible] = await Promise.all([
      this.repo.findByApartmentAndUser(apartmentId, userId),
      this.bookings.hasConfirmedStay(userId, apartmentId),
    ]);
    return {
      mine: existing ? this.toDto(existing) : null,
      // May review if they've stayed; an existing review can always be edited.
      canReview: eligible || existing !== null,
    };
  }

  async upsert(
    apartmentId: string,
    userId: string,
    dto: UpsertReviewDto,
    ctx: RequestContext,
  ): Promise<ReviewDto> {
    const eligible = await this.bookings.hasConfirmedStay(userId, apartmentId);
    if (!eligible) {
      throw new ForbiddenException(
        'Only guests with a confirmed stay can review this apartment',
      );
    }
    const review = await this.repo.upsert(apartmentId, userId, {
      rating: dto.rating,
      comment: dto.comment?.trim() || null,
    });
    await this.audit.record({
      action: 'review.upsert',
      userId,
      entity: 'Review',
      entityId: review.id,
      metadata: { apartmentId, rating: dto.rating },
      ...ctx,
    });
    return this.toDto(review);
  }

  async deleteMine(
    apartmentId: string,
    userId: string,
    ctx: RequestContext,
  ): Promise<void> {
    const { count } = await this.repo.deleteByApartmentAndUser(
      apartmentId,
      userId,
    );
    if (count === 0) {
      throw new NotFoundException('Review not found');
    }
    await this.audit.record({
      action: 'review.delete',
      userId,
      entity: 'Review',
      metadata: { apartmentId },
      ...ctx,
    });
  }

  // ── admin ──

  async adminList(query: ReviewQueryDto): Promise<PaginatedAdminReviews> {
    const { items, total } = await this.repo.adminList({
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return {
      items: items.map((r) => this.toAdminDto(r)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async adminDelete(
    id: string,
    actorId: string,
    ctx: RequestContext,
  ): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('Review not found');
    }
    await this.repo.delete(id);
    await this.audit.record({
      action: 'review.admin_delete',
      userId: actorId,
      entity: 'Review',
      entityId: id,
      metadata: { apartmentId: existing.apartmentId },
      ...ctx,
    });
  }

  // ── internals ──

  private toSummary(s: {
    average: number;
    count: number;
    distribution: Record<number, number>;
  }): ReviewSummary {
    return {
      average: Math.round(s.average * 10) / 10,
      count: s.count,
      distribution: {
        1: s.distribution[1] ?? 0,
        2: s.distribution[2] ?? 0,
        3: s.distribution[3] ?? 0,
        4: s.distribution[4] ?? 0,
        5: s.distribution[5] ?? 0,
      },
    };
  }

  /** "Sample U." — first name + last initial, never the full surname or email. */
  private authorName(
    firstName: string | null,
    lastName: string | null,
  ): string {
    const first = firstName?.trim();
    const initial = lastName?.trim()?.[0];
    if (first && initial) return `${first} ${initial.toUpperCase()}.`;
    if (first) return first;
    return 'Guest';
  }

  private toDto(r: ReviewWithAuthor): ReviewDto {
    return {
      id: r.id,
      apartmentId: r.apartmentId,
      rating: r.rating,
      comment: r.comment,
      authorName: this.authorName(r.user.firstName, r.user.lastName),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  private toAdminDto(r: AdminReviewRow): AdminReviewDto {
    return {
      id: r.id,
      apartmentId: r.apartmentId,
      apartmentTitle:
        (r.apartment.title as Record<string, string> | null) ?? null,
      rating: r.rating,
      comment: r.comment,
      authorName: this.authorName(r.user.firstName, r.user.lastName),
      authorEmail: r.user.email,
      createdAt: r.createdAt.toISOString(),
    };
  }
}
