import type { LocalizedText } from '@/lib/i18n-content';

export interface Review {
  id: string;
  apartmentId: string;
  rating: number;
  comment: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ApartmentReviews {
  summary: ReviewSummary;
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MyReviewState {
  mine: Review | null;
  canReview: boolean;
}

export interface UpsertReviewInput {
  rating: number;
  comment?: string;
}

export interface AdminReview {
  id: string;
  apartmentId: string;
  apartmentTitle: LocalizedText | null;
  rating: number;
  comment: string | null;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

export interface PaginatedAdminReviews {
  items: AdminReview[];
  total: number;
  page: number;
  pageSize: number;
}
