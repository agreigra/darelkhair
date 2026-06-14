import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  PaymentStatus,
  Prisma,
  type Booking,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

export type RecentBookingRow = Prisma.BookingGetPayload<{
  include: {
    user: { select: { email: true; firstName: true; lastName: true } };
    apartment: {
      select: { title: true; images: { select: { url: true } } };
    };
  };
}>;

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  bookingsByStatus() {
    return this.prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  }

  countUpcoming(now: Date): Promise<number> {
    return this.prisma.booking.count({
      where: { status: BookingStatus.CONFIRMED, checkIn: { gte: now } },
    });
  }

  async revenue(since?: Date): Promise<number> {
    const where: Prisma.PaymentWhereInput = { status: PaymentStatus.VERIFIED };
    if (since) where.verifiedAt = { gte: since };
    const agg = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where,
    });
    return Number(agg._sum.amount ?? 0);
  }

  pendingPayments(): Promise<number> {
    return this.prisma.payment.count({
      where: { status: PaymentStatus.SUBMITTED },
    });
  }

  apartmentCounts(): Promise<[number, number]> {
    return this.prisma.$transaction([
      this.prisma.apartment.count(),
      this.prisma.apartment.count({ where: { isPublished: true } }),
    ]);
  }

  userCount(): Promise<number> {
    return this.prisma.user.count();
  }

  newContactMessages(): Promise<number> {
    return this.prisma.contactMessage.count({ where: { status: 'NEW' } });
  }

  /** Bookings created since `since` — bucketed in JS for the monthly volume trend. */
  bookingsSince(
    since: Date,
  ): Promise<Array<Pick<Booking, 'createdAt'>>> {
    return this.prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
  }

  /** Verified payments since `since` — bucketed in JS for the monthly revenue trend. */
  verifiedPaymentsSince(
    since: Date,
  ): Promise<Array<{ verifiedAt: Date | null; amount: Prisma.Decimal }>> {
    return this.prisma.payment.findMany({
      where: { status: PaymentStatus.VERIFIED, verifiedAt: { gte: since } },
      select: { verifiedAt: true, amount: true },
    });
  }

  recentBookings(take: number): Promise<RecentBookingRow[]> {
    return this.prisma.booking.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        apartment: {
          select: {
            title: true,
            images: {
              where: { isCover: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });
  }
}
