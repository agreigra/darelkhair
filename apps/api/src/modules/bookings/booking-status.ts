import { BookingStatus } from '@prisma/client';

/**
 * The booking status machine. Each status maps to the set of statuses it may
 * legally move to. CANCELLED is terminal. Transitions are enforced server-side
 * (BookingsService.transition) so the trail in BookingStatusHistory is always
 * a sequence of valid moves.
 *
 *   WAITING_PAYMENT ─▶ PROOF_SUBMITTED ─▶ CONFIRMED ─▶ HONORED
 *          │                  │ │
 *          ▼                  │ ▼ (reject → ask again)
 *      CANCELLED ◀────────────┴─ WAITING_PAYMENT
 *
 * Bookings are created directly in WAITING_PAYMENT (offline payment flow — no
 * admin-approval step). HONORED is terminal — set by an admin once the stay is
 * completed.
 */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.WAITING_PAYMENT]: [
    // PROOF_SUBMITTED when a bank/mobile proof is uploaded; CONFIRMED directly
    // when the admin confirms a cash payment (no proof to review).
    BookingStatus.PROOF_SUBMITTED,
    BookingStatus.CONFIRMED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.PROOF_SUBMITTED]: [
    BookingStatus.CONFIRMED,
    BookingStatus.WAITING_PAYMENT,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.CONFIRMED]: [BookingStatus.HONORED, BookingStatus.CANCELLED],
  [BookingStatus.HONORED]: [],
  [BookingStatus.CANCELLED]: [],
};

/** Statuses a guest is allowed to self-cancel from (before payment is in play). */
export const USER_CANCELLABLE: BookingStatus[] = [BookingStatus.WAITING_PAYMENT];

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[from].includes(to);
}
