'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { availabilityApi } from '../api/availability.api';

/** Public: unavailable ranges (blocks + bookings) within a window. */
export function useUnavailableRanges(
  apartmentId: string,
  from: string,
  to: string,
) {
  return useQuery({
    queryKey: ['availability', apartmentId, from, to],
    queryFn: () => availabilityApi.getUnavailable(apartmentId, from, to),
    enabled: Boolean(apartmentId),
  });
}

/** Public: confirm a specific stay is bookable (used once a range is picked). */
export function useAvailabilityCheck(
  apartmentId: string,
  checkIn: string | undefined,
  checkOut: string | undefined,
) {
  return useQuery({
    queryKey: ['availability-check', apartmentId, checkIn, checkOut],
    queryFn: () => availabilityApi.check(apartmentId, checkIn!, checkOut!),
    enabled: Boolean(apartmentId && checkIn && checkOut),
  });
}

const adminKey = (apartmentId: string) =>
  ['admin-availability', apartmentId] as const;

/** Admin: list of blocked slots. */
export function useAvailabilitySlots(apartmentId: string) {
  return useQuery({
    queryKey: adminKey(apartmentId),
    queryFn: () => availabilityApi.listSlots(apartmentId),
    enabled: Boolean(apartmentId),
  });
}

export function useCreateBlock(apartmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: string; endDate: string }) =>
      availabilityApi.createBlock(apartmentId, startDate, endDate),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKey(apartmentId) });
      void qc.invalidateQueries({ queryKey: ['availability', apartmentId] });
    },
  });
}

export function useDeleteBlock(apartmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) =>
      availabilityApi.deleteSlot(apartmentId, slotId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKey(apartmentId) });
      void qc.invalidateQueries({ queryKey: ['availability', apartmentId] });
    },
  });
}
