import type { LocalizedText } from '@/lib/i18n-content';

export interface ApartmentImage {
  id: string;
  url: string;
  alt: string | null;
  isCover: boolean;
  sortOrder: number;
}

export interface Apartment {
  id: string;
  title: LocalizedText;
  description: LocalizedText | null;
  address: LocalizedText | null;
  city: LocalizedText | null;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  isPublished: boolean;
  images: ApartmentImage[];
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedApartments {
  items: Apartment[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApartmentFilters {
  page: number;
  pageSize: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
}

export interface ApartmentImageInput {
  url: string;
  alt?: string;
  isCover?: boolean;
  sortOrder?: number;
}

export interface CreateApartmentInput {
  title: LocalizedText;
  description?: LocalizedText;
  address?: LocalizedText;
  city?: LocalizedText;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  isPublished?: boolean;
}

export type UpdateApartmentInput = Partial<CreateApartmentInput>;
