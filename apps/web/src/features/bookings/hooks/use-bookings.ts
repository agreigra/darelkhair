'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings.api';
import type { BookingFilters, CreateBookingInput } from '../types/booking.types';

// ── guest queries ──

export function useMyBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingsApi.listMine(filters),
    placeholderData: keepPreviousData,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingsApi.create(input),
    onSuccess: (booking) => {
      void qc.invalidateQueries({ queryKey: ['bookings'] });
      // The new booking blocks those dates — refresh the apartment's calendar.
      void qc.invalidateQueries({
        queryKey: ['availability', booking.apartmentId],
      });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: (booking) => {
      void qc.invalidateQueries({ queryKey: ['bookings'] });
      void qc.invalidateQueries({ queryKey: ['booking', booking.id] });
      void qc.invalidateQueries({
        queryKey: ['availability', booking.apartmentId],
      });
    },
  });
}
