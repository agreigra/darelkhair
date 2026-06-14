/** A review as shown publicly (author first name + last initial, no email). */
export interface ReviewDto {
  id: string;
  apartmentId: string;
  rating: number;
  comment: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

/** Aggregate rating info for an apartment. */
export interface ReviewSummary {
  average: number; // 0 when there are no reviews
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

/** Public, paginated review list for an apartment + its aggregate summary. */
export interface ApartmentReviews {
  summary: ReviewSummary;
  items: ReviewDto[];
  total: number;
  page: number;
  pageSize: number;
}

/** The caller's own review state for an apartment (drives the review form). */
export interface MyReviewState {
  mine: ReviewDto | null;
  /** Whether the caller may post a review (confirmed stay; editable if one exists). */
  canReview: boolean;
}

/** Public highlight for the home page — privacy-safe author + apartment context. */
export interface FeaturedReviewDto {
  id: string;
  apartmentId: string;
  apartmentTitle: Record<string, string> | null;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

/** Admin moderation view: includes author email + localized apartment title. */
export interface AdminReviewDto {
  id: string;
  apartmentId: string;
  apartmentTitle: Record<string, string> | null;
  rating: number;
  comment: string | null;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

export interface PaginatedAdminReviews {
  items: AdminReviewDto[];
  total: number;
  page: number;
  pageSize: number;
}
