import type { BookingStatus } from '@/components/shared/types';
import type { LocalizedText } from '@/lib/i18n-content';

export interface MonthlyPoint {
  month: string; // YYYY-MM
  bookings: number;
  revenue: number;
}

export interface DashboardRecentBooking {
  id: string;
  reference: string;
  guestEmail: string;
  guestName: string | null;
  apartmentTitle: LocalizedText | null;
  status: BookingStatus;
  totalPrice: number;
  checkIn: string;
  checkOut: string;
  createdAt: string;
}

export interface DashboardOverview {
  bookings: {
    total: number;
    upcoming: number;
    byStatus: Record<BookingStatus, number>;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
  payments: {
    pendingReview: number;
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
