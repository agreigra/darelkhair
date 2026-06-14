import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

const reviewInclude = {
  user: { select: { firstName: true, lastName: true } },
} satisfies Prisma.ReviewInclude;

export type ReviewWithAuthor = Prisma.ReviewGetPayload<{
  include: typeof reviewInclude;
}>;

const adminReviewInclude = {
  user: { select: { firstName: true, lastName: true, email: true } },
  apartment: { select: { title: true } },
} satisfies Prisma.ReviewInclude;

export type AdminReviewRow = Prisma.ReviewGetPayload<{
  include: typeof adminReviewInclude;
}>;

const featuredReviewInclude = {
  user: { select: { firstName: true, lastName: true } },
  apartment: { select: { id: true, title: true, isPublished: true } },
} satisfies Prisma.ReviewInclude;

export type FeaturedReviewRow = Prisma.ReviewGetPayload<{
  include: typeof featuredReviewInclude;
}>;

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByApartmentAndUser(
    apartmentId: string,
    userId: string,
  ): Promise<ReviewWithAuthor | null> {
    return this.prisma.review.findUnique({
      where: { apartmentId_userId: { apartmentId, userId } },
      include: reviewInclude,
    });
  }

  /** Recent, highly-rated, commented reviews on published apartments (home page). */
  featured(limit: number): Promise<FeaturedReviewRow[]> {
    return this.prisma.review.findMany({
      where: {
        rating: { gte: 4 },
        comment: { not: null },
        apartment: { isPublished: true },
      },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: featuredReviewInclude,
    });
  }

  findById(id: string): Promise<ReviewWithAuthor | null> {
    return this.prisma.review.findUnique({
      where: { id },
      include: reviewInclude,
    });
  }

  upsert(
    apartmentId: string,
    userId: string,
    data: { rating: number; comment: string | null },
  ): Promise<ReviewWithAuthor> {
    return this.prisma.review.upsert({
      where: { apartmentId_userId: { apartmentId, userId } },
      create: { apartmentId, userId, ...data },
      update: data,
      include: reviewInclude,
    });
  }

  deleteByApartmentAndUser(
    apartmentId: string,
    userId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.review.deleteMany({ where: { apartmentId, userId } });
  }

  delete(id: string): Promise<{ id: string }> {
    return this.prisma.review.delete({ where: { id }, select: { id: true } });
  }

  async listForApartment(params: {
    apartmentId: string;
    skip: number;
    take: number;
  }): Promise<{ items: ReviewWithAuthor[]; total: number }> {
    const where: Prisma.ReviewWhereInput = { apartmentId: params.apartmentId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: reviewInclude,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items, total };
  }

  async adminList(params: {
    skip: number;
    take: number;
  }): Promise<{ items: AdminReviewRow[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: adminReviewInclude,
      }),
      this.prisma.review.count(),
    ]);
    return { items, total };
  }

  /** Average + count + per-star distribution for an apartment. */
  async summary(apartmentId: string): Promise<{
    average: number;
    count: number;
    distribution: Record<number, number>;
  }> {
    const [agg, byRating] = await Promise.all([
      this.prisma.review.aggregate({
        where: { apartmentId },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { apartmentId },
        orderBy: { rating: 'asc' },
        _count: { _all: true },
      }),
    ]);

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of byRating) distribution[row.rating] = row._count._all;

    return {
      average: agg._avg.rating ?? 0,
      count: agg._count._all,
      distribution,
    };
  }
}
