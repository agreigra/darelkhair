'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { paymentsApi } from '../api/payments.api';
import type { PaymentFilters } from '../types/payment.types';

export function useAdminPayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: ['admin-payments', filters],
    queryFn: () => paymentsApi.adminList(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminBookingPayment(bookingId: string) {
  return useQuery({
    queryKey: ['admin-booking-payment', bookingId],
    queryFn: () => paymentsApi.adminGetForBooking(bookingId),
    enabled: Boolean(bookingId),
  });
}

/** Verify/reject invalidate payment + booking caches so both views refresh. */
function useReviewInvalidation() {
  const qc = useQueryClient();
  return (bookingId: string) => {
    void qc.invalidateQueries({ queryKey: ['admin-payments'] });
    void qc.invalidateQueries({ queryKey: ['admin-booking', bookingId] });
    void qc.invalidateQueries({ queryKey: ['admin-booking-payment', bookingId] });
    void qc.invalidateQueries({ queryKey: ['admin-bookings'] });
    void qc.invalidateQueries({ queryKey: ['payment', bookingId] });
    void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
  };
}

export function useVerifyPayment() {
  const invalidate = useReviewInvalidation();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.verify(id),
    onSuccess: (payment) => invalidate(payment.bookingId),
  });
}

export function useRejectPayment() {
  const invalidate = useReviewInvalidation();
  return useMutation({
    mutationFn: (input: { id: string; note?: string }) =>
      paymentsApi.reject(input.id, input.note),
    onSuccess: (payment) => invalidate(payment.bookingId),
  });
}
