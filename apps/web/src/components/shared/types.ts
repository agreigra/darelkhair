/**
 * Shared view types used by the cross-feature reusable components.
 * Feature steps map their API responses onto these shapes.
 */

export type BookingStatus =
  | 'PENDING'
  | 'WAITING_PAYMENT'
  | 'PROOF_SUBMITTED'
  | 'CONFIRMED'
  | 'CANCELLED';

export interface ApartmentSummary {
  id: string;
  title: string;
  city?: string | null;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  coverImageUrl?: string | null;
}

export interface BookingSummary {
  id: string;
  reference: string;
  apartmentTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
}
