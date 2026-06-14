import type { BookingStatus } from '@prisma/client';

/** A single month bucket in the 6-month trend. */
export interface MonthlyPoint {
  month: string; // YYYY-MM
  bookings: number;
  revenue: number; // confirmed-booking value in that month
}

export interface DashboardRecentBooking {
  id: string;
  reference: string;
  guestEmail: string;
  guestName: string | null;
  apartmentTitle: Record<string, string> | null;
  status: BookingStatus;
  totalPrice: number;
  checkIn: string;
  checkOut: string;
  createdAt: string;
}

export interface DashboardOverview {
  bookings: {
    total: number;
    upcoming: number; // confirmed, check-in in the future
    byStatus: Record<BookingStatus, number>;
  };
  revenue: {
    total: number; // sum of VERIFIED payment amounts
    thisMonth: number; // VERIFIED payments verified this calendar month
  };
  payments: {
    pendingReview: number; // SUBMITTED payments awaiting admin action
  };
  apartments: {
    total: number;
    published: number;
  };
  users: {
    total: number;
  };
  contact: {
    newMessages: number;
  };
  trend: MonthlyPoint[];
  recentBookings: DashboardRecentBooking[];
}
