import { BookingStatus } from '@prisma/client';

/**
 * The booking status machine. Each status maps to the set of statuses it may
 * legally move to. CANCELLED is terminal. Transitions are enforced server-side
 * (BookingsService.transition) so the trail in BookingStatusHistory is always
 * a sequence of valid moves.
 *
 *   PENDING ─▶ WAITING_PAYMENT ─▶ PROOF_SUBMITTED ─▶ CONFIRMED
 *      │              │                  │ │
 *      ▼              ▼                  │ ▼ (reject → ask again)
 *   CANCELLED ◀───────┴──────────────────┴─ WAITING_PAYMENT
 */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [
    BookingStatus.WAITING_PAYMENT,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.WAITING_PAYMENT]: [
    BookingStatus.PROOF_SUBMITTED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.PROOF_SUBMITTED]: [
    BookingStatus.CONFIRMED,
    BookingStatus.WAITING_PAYMENT,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED],
  [BookingStatus.CANCELLED]: [],
};

/** Statuses a guest is allowed to self-cancel from (before payment is in play). */
export const USER_CANCELLABLE: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.WAITING_PAYMENT,
];

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[from].includes(to);
}
