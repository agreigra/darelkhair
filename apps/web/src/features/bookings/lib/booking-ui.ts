import { parseDateOnly } from '@/lib/date';
import type { BookingStatus } from '../types/booking.types';

export const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING',
  'WAITING_PAYMENT',
  'PROOF_SUBMITTED',
  'CONFIRMED',
  'CANCELLED',
];

/** Mirrors the backend state machine (booking-status.ts) for the admin controls. */
export const ALLOWED_NEXT: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['WAITING_PAYMENT', 'CANCELLED'],
  WAITING_PAYMENT: ['PROOF_SUBMITTED', 'CANCELLED'],
  PROOF_SUBMITTED: ['CONFIRMED', 'WAITING_PAYMENT', 'CANCELLED'],
  CONFIRMED: ['CANCELLED'],
  CANCELLED: [],
};

/** Statuses from which a guest may self-cancel (mirrors USER_CANCELLABLE). */
export const USER_CANCELLABLE: BookingStatus[] = ['PENDING', 'WAITING_PAYMENT'];

/** Format a YYYY-MM-DD string for display in the active locale. */
export function formatDate(value: string, locale: string): string {
  return parseDateOnly(value).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
