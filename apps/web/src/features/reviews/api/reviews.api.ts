import { apiClient, unwrap } from '@/lib/api-client';
import type {
  ApartmentReviews,
  MyReviewState,
  PaginatedAdminReviews,
  Review,
  UpsertReviewInput,
} from '../types/review.types';

export const reviewsApi = {
  // ── public / guest (scoped to an apartment) ──
  async list(
    apartmentId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<ApartmentReviews> {
    const { data } = await apiClient.get(
      `/apartments/${apartmentId}/reviews`,
      { params },
    );
    return unwrap<ApartmentReviews>(data);
  },

  async mine(apartmentId: string): Promise<MyReviewState> {
    const { data } = await apiClient.get(
      `/apartments/${apartmentId}/reviews/me`,
    );
    return unwrap<MyReviewState>(data);
  },

  async upsert(
    apartmentId: string,
    input: UpsertReviewInput,
  ): Promise<Review> {
    const { data } = await apiClient.post(
      `/apartments/${apartmentId}/reviews`,
      input,
    );
    return unwrap<Review>(data);
  },

  async deleteMine(apartmentId: string): Promise<void> {
    await apiClient.delete(`/apartments/${apartmentId}/reviews/me`);
  },

  // ── admin ──
  async adminList(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedAdminReviews> {
    const { data } = await apiClient.get('/admin/reviews', { params });
    return unwrap<PaginatedAdminReviews>(data);
  },

  async adminRemove(id: string): Promise<void> {
    await apiClient.delete(`/admin/reviews/${id}`);
  },
};
