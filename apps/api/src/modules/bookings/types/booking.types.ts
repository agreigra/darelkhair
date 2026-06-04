import type { BookingStatus } from '@prisma/client';
import type { LocalizedText } from '@/common/i18n/localized-text';

export interface BookingApartmentSummary {
  id: string;
  title: LocalizedText;
  city: LocalizedText | null;
  coverImageUrl: string | null;
}

/** Guest details — only attached on admin-facing payloads. */
export interface BookingUserSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface BookingStatusHistoryDto {
  id: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  note: string | null;
  createdAt: string;
}

export interface BookingDto {
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
  /** Detail views only. */
  history?: BookingStatusHistoryDto[];
  /** Admin views only. */
  user?: BookingUserSummary;
}

export interface PaginatedBookings {
  items: BookingDto[];
  total: number;
  page: number;
  pageSize: number;
}
