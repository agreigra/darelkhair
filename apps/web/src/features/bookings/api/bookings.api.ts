import { apiClient, unwrap } from '@/lib/api-client';
import type {
  Booking,
  BookingFilters,
  BookingStatus,
  CreateBookingInput,
  PaginatedBookings,
} from '../types/booking.types';

function toParams(filters: BookingFilters): Record<string, unknown> {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    status: filters.status,
    search: filters.search || undefined,
  };
}

export const bookingsApi = {
  // ── guest ──
  async create(input: CreateBookingInput): Promise<Booking> {
    const { data } = await apiClient.post('/bookings', input);
    return unwrap<Booking>(data);
  },

  async listMine(filters: BookingFilters): Promise<PaginatedBookings> {
    const { data } = await apiClient.get('/bookings', {
      params: toParams(filters),
    });
    return unwrap<PaginatedBookings>(data);
  },

  async get(id: string): Promise<Booking> {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return unwrap<Booking>(data);
  },

  async cancel(id: string): Promise<Booking> {
    const { data } = await apiClient.patch(`/bookings/${id}/cancel`);
    return unwrap<Booking>(data);
  },

  // ── admin ──
  async adminList(filters: BookingFilters): Promise<PaginatedBookings> {
    const { data } = await apiClient.get('/admin/bookings', {
      params: toParams(filters),
    });
    return unwrap<PaginatedBookings>(data);
  },

  async adminGet(id: string): Promise<Booking> {
    const { data } = await apiClient.get(`/admin/bookings/${id}`);
    return unwrap<Booking>(data);
  },

  async updateStatus(
    id: string,
    status: BookingStatus,
    note?: string,
  ): Promise<Booking> {
    const { data } = await apiClient.patch(`/admin/bookings/${id}/status`, {
      status,
      note,
    });
    return unwrap<Booking>(data);
  },
};
