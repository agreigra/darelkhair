import type { LocalizedText } from '@/common/i18n/localized-text';

export interface ApartmentImageDto {
  id: string;
  url: string;
  alt: string | null;
  isCover: boolean;
  sortOrder: number;
}

export interface ApartmentDto {
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
  images: ApartmentImageDto[];
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedApartments {
  items: ApartmentDto[];
  total: number;
  page: number;
  pageSize: number;
}
