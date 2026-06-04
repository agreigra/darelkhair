import type { Matcher } from 'react-day-picker';
import { addDays, parseDateOnly } from '@/lib/date';
import type { UnavailableRange } from '../types/availability.types';

/**
 * Convert API unavailable ranges into react-day-picker disabled matchers.
 * Blocks are inclusive [start, end]; bookings are half-open [start, end) so the
 * checkout day stays selectable (matches the backend's overlap semantics).
 */
export function rangesToDisabled(ranges: UnavailableRange[]): Matcher[] {
  return ranges.map((r) => {
    const from = parseDateOnly(r.start);
    const to =
      r.type === 'booked'
        ? addDays(parseDateOnly(r.end), -1)
        : parseDateOnly(r.end);
    return { from, to };
  });
}
