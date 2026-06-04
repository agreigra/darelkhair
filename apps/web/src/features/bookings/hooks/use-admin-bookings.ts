'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings.api';
import type { BookingFilters, BookingStatus } from '../types/booking.types';

export function useAdminBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: () => bookingsApi.adminList(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminBooking(id: string) {
  return useQuery({
    queryKey: ['admin-booking', id],
    queryFn: () => bookingsApi.adminGet(id),
    enabled: Boolean(id),
  });
}

export function useUpdateBookingStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { status: BookingStatus; note?: string }) =>
      bookingsApi.updateStatus(id, input.status, input.note),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      void qc.invalidateQueries({ queryKey: ['admin-booking', id] });
    },
  });
}
