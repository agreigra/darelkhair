'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apartmentsApi } from '../api/apartments.api';
import type { ApartmentFilters } from '../types/apartment.types';

/** Public, published apartment listing. */
export function useApartments(filters: ApartmentFilters) {
  return useQuery({
    queryKey: ['apartments', filters],
    queryFn: () => apartmentsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

/** Public apartment detail. */
export function useApartment(id: string) {
  return useQuery({
    queryKey: ['apartment', id],
    queryFn: () => apartmentsApi.get(id),
    enabled: Boolean(id),
  });
}
