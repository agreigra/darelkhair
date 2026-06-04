'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments.api';
import type { SubmitPaymentInput } from '../types/payment.types';

export function usePaymentInstructions() {
  return useQuery({
    queryKey: ['payment-instructions'],
    queryFn: () => paymentsApi.instructions(),
    staleTime: 1000 * 60 * 60, // instructions rarely change
  });
}

export function useBookingPayment(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ['payment', bookingId],
    queryFn: () => paymentsApi.getForBooking(bookingId),
    enabled: enabled && Boolean(bookingId),
  });
}

export function useSubmitPayment(bookingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitPaymentInput) =>
      paymentsApi.submit(bookingId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['payment', bookingId] });
      void qc.invalidateQueries({ queryKey: ['booking', bookingId] });
      void qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
