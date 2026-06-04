const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse a YYYY-MM-DD string into a Date at UTC midnight. Stored in `@db.Date`
 * columns so only the calendar date is kept (no timezone drift).
 */
export function parseDateOnly(value: string): Date {
  if (!DATE_ONLY.test(value)) {
    throw new Error(`Invalid date (expected YYYY-MM-DD): ${value}`);
  }
  return new Date(`${value}T00:00:00.000Z`);
}

/** Format a Date back to YYYY-MM-DD using its UTC date part. */
export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today at UTC midnight — the lower bound for new bookings (matches @db.Date). */
export function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/** Whole nights between two UTC-midnight dates. */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
}
