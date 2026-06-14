import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { formatDateOnly } from '@/common/utils/date';
import { DashboardRepository, type RecentBookingRow } from './dashboard.repository';
import type {
  DashboardOverview,
  DashboardRecentBooking,
  MonthlyPoint,
} from './types/dashboard.types';

const TREND_MONTHS = 6;
const RECENT_LIMIT = 6;

@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async overview(): Promise<DashboardOverview> {
    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const windowStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (TREND_MONTHS - 1), 1),
    );

    const [
      byStatusRows,
      upcoming,
      revenueTotal,
      revenueThisMonth,
      pendingReview,
      [apartmentsTotal, apartmentsPublished],
      usersTotal,
      newMessages,
      trendBookings,
      trendPayments,
      recentRows,
    ] = await Promise.all([
      this.repo.bookingsByStatus(),
      this.repo.countUpcoming(now),
      this.repo.revenue(),
      this.repo.revenue(monthStart),
      this.repo.pendingPayments(),
      this.repo.apartmentCounts(),
      this.repo.userCount(),
      this.repo.newContactMessages(),
      this.repo.bookingsSince(windowStart),
      this.repo.verifiedPaymentsSince(windowStart),
      this.repo.recentBookings(RECENT_LIMIT),
    ]);

    const byStatus = this.emptyStatusRecord();
    let bookingsTotal = 0;
    for (const row of byStatusRows) {
      byStatus[row.status] = row._count._all;
      bookingsTotal += row._count._all;
    }

    return {
      bookings: { total: bookingsTotal, upcoming, byStatus },
      revenue: { total: revenueTotal, thisMonth: revenueThisMonth },
      payments: { pendingReview },
      apartments: { total: apartmentsTotal, published: apartmentsPublished },
      users: { total: usersTotal },
      contact: { newMessages },
      trend: this.buildTrend(trendBookings, trendPayments, now),
      recentBookings: recentRows.map((b) => this.toRecent(b)),
    };
  }

  // ── internals ──

  private emptyStatusRecord(): Record<BookingStatus, number> {
    return {
      [BookingStatus.WAITING_PAYMENT]: 0,
      [BookingStatus.PROOF_SUBMITTED]: 0,
      [BookingStatus.CONFIRMED]: 0,
      [BookingStatus.HONORED]: 0,
      [BookingStatus.CANCELLED]: 0,
    };
  }

  private buildTrend(
    bookings: Array<{ createdAt: Date }>,
    payments: Array<{ verifiedAt: Date | null; amount: unknown }>,
    now: Date,
  ): MonthlyPoint[] {
    // Seed an ordered map of the last N months so empty months still appear.
    const buckets = new Map<string, MonthlyPoint>();
    for (let i = TREND_MONTHS - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = this.monthKey(d);
      buckets.set(key, { month: key, bookings: 0, revenue: 0 });
    }

    // Bookings: volume by creation month. Revenue: actually-collected (verified
    // payments) by verification month — same basis as the "revenue collected" card.
    for (const b of bookings) {
      const bucket = buckets.get(this.monthKey(b.createdAt));
      if (bucket) bucket.bookings += 1;
    }
    for (const p of payments) {
      if (!p.verifiedAt) continue;
      const bucket = buckets.get(this.monthKey(p.verifiedAt));
      if (bucket) bucket.revenue += Number(p.amount);
    }

    return [...buckets.values()];
  }

  private monthKey(d: Date): string {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  private toRecent(b: RecentBookingRow): DashboardRecentBooking {
    const name = [b.user.firstName, b.user.lastName].filter(Boolean).join(' ');
    return {
      id: b.id,
      reference: b.reference,
      guestEmail: b.user.email,
      guestName: name || null,
      apartmentTitle:
        (b.apartment.title as Record<string, string> | null) ?? null,
      status: b.status,
      totalPrice: Number(b.totalPrice),
      checkIn: formatDateOnly(b.checkIn),
      checkOut: formatDateOnly(b.checkOut),
      createdAt: b.createdAt.toISOString(),
    };
  }
}
