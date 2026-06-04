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
