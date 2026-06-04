export type UnavailableType = 'blocked' | 'booked';

export interface UnavailableRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  type: UnavailableType;
}

export interface AvailabilitySlot {
  id: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
}

export interface AvailabilityCheckResult {
  available: boolean;
  reason?: UnavailableType;
}
