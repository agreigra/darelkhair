/**
 * Date-only helpers. The API exchanges calendar dates as YYYY-MM-DD strings;
 * we parse/format them to **local** midnight so react-day-picker never shows a
 * day off-by-one due to timezone conversion.
 */

/** Parse "YYYY-MM-DD" to a local-midnight Date. */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date to "YYYY-MM-DD" using its local date parts. */
export function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today at local midnight. */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Add `days` to a date, returning a new Date. */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
