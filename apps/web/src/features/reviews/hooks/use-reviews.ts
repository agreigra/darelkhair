'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { reviewsApi } from '../api/reviews.api';
import type { UpsertReviewInput } from '../types/review.types';

/** Public, paginated reviews + summary for an apartment. */
export function useApartmentReviews(apartmentId: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', apartmentId, page],
    queryFn: () => reviewsApi.list(apartmentId, { page, pageSize: 10 }),
    placeholderData: keepPreviousData,
  });
}

/** The signed-in user's own review state (drives the form); skipped when anon. */
export function useMyReview(apartmentId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['my-review', apartmentId],
    queryFn: () => reviewsApi.mine(apartmentId),
    enabled: isAuthenticated && Boolean(apartmentId),
  });
}

export function useUpsertReview(apartmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertReviewInput) =>
      reviewsApi.upsert(apartmentId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews', apartmentId] });
      void queryClient.invalidateQueries({ queryKey: ['my-review', apartmentId] });
    },
  });
}

export function useDeleteMyReview(apartmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reviewsApi.deleteMine(apartmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews', apartmentId] });
      void queryClient.invalidateQueries({ queryKey: ['my-review', apartmentId] });
    },
  });
}

// ── admin ──

export function useAdminReviews(page = 1) {
  return useQuery({
    queryKey: ['admin-reviews', page],
    queryFn: () => reviewsApi.adminList({ page, pageSize: 10 }),
    placeholderData: keepPreviousData,
  });
}

export function useAdminDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.adminRemove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
}
