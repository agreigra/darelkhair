export type UnavailableType = 'blocked' | 'booked';

/** A date range (inclusive of `start`) that cannot be booked. */
export interface UnavailableRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  type: UnavailableType;
}

export interface AvailabilitySlotDto {
  id: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
}

export interface AvailabilityCheckResult {
  available: boolean;
  reason?: UnavailableType;
}
