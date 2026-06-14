import { parseDateOnly } from '@/lib/date';
import type { BookingStatus } from '../types/booking.types';

export const BOOKING_STATUSES: BookingStatus[] = [
  'WAITING_PAYMENT',
  'PROOF_SUBMITTED',
  'CONFIRMED',
  'HONORED',
  'CANCELLED',
];

/** Mirrors the backend state machine (booking-status.ts) for the admin controls. */
export const ALLOWED_NEXT: Record<BookingStatus, BookingStatus[]> = {
  WAITING_PAYMENT: ['PROOF_SUBMITTED', 'CONFIRMED', 'CANCELLED'],
  PROOF_SUBMITTED: ['CONFIRMED', 'WAITING_PAYMENT', 'CANCELLED'],
  CONFIRMED: ['HONORED', 'CANCELLED'],
  HONORED: [],
  CANCELLED: [],
};

/** Statuses from which a guest may self-cancel (mirrors USER_CANCELLABLE). */
export const USER_CANCELLABLE: BookingStatus[] = ['WAITING_PAYMENT'];

/** Format a YYYY-MM-DD string for display in the active locale. */
export function formatDate(value: string, locale: string): string {
  return parseDateOnly(value).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
