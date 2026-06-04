import type { LocalizedText } from '@/lib/i18n-content';
import type { BookingStatus } from '@/components/shared/types';

export type { BookingStatus };

export interface BookingApartmentSummary {
  id: string;
  title: LocalizedText;
  city: LocalizedText | null;
  coverImageUrl: string | null;
}

export interface BookingUserSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface BookingStatusHistoryItem {
  id: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  note: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  reference: string;
  apartmentId: string;
  apartment: BookingApartmentSummary;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  history?: BookingStatusHistoryItem[];
  user?: BookingUserSummary;
}

export interface PaginatedBookings {
  items: Booking[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BookingFilters {
  page: number;
  pageSize: number;
  status?: BookingStatus;
  search?: string;
}

export interface CreateBookingInput {
  apartmentId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}
