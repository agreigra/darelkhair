import { apiClient, unwrap } from '@/lib/api-client';
import type {
  Apartment,
  ApartmentFilters,
  ApartmentImageInput,
  CreateApartmentInput,
  PaginatedApartments,
  UpdateApartmentInput,
} from '../types/apartment.types';

function toParams(f: ApartmentFilters) {
  return {
    page: f.page,
    pageSize: f.pageSize,
    search: f.search || undefined,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
    guests: f.guests,
  };
}

export const apartmentsApi = {
  // ── public ──
  async list(filters: ApartmentFilters): Promise<PaginatedApartments> {
    const { data } = await apiClient.get('/apartments', {
      params: toParams(filters),
    });
    return unwrap<PaginatedApartments>(data);
  },

  async get(id: string): Promise<Apartment> {
    const { data } = await apiClient.get(`/apartments/${id}`);
    return unwrap<Apartment>(data);
  },

  // ── admin ──
  async adminList(filters: ApartmentFilters): Promise<PaginatedApartments> {
    const { data } = await apiClient.get('/admin/apartments', {
      params: toParams(filters),
    });
    return unwrap<PaginatedApartments>(data);
  },

  async adminGet(id: string): Promise<Apartment> {
    const { data } = await apiClient.get(`/admin/apartments/${id}`);
    return unwrap<Apartment>(data);
  },

  async create(input: CreateApartmentInput): Promise<Apartment> {
    const { data } = await apiClient.post('/admin/apartments', input);
    return unwrap<Apartment>(data);
  },

  async update(id: string, input: UpdateApartmentInput): Promise<Apartment> {
    const { data } = await apiClient.patch(`/admin/apartments/${id}`, input);
    return unwrap<Apartment>(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/admin/apartments/${id}`);
  },

  async addImage(id: string, input: ApartmentImageInput): Promise<Apartment> {
    const { data } = await apiClient.post(`/admin/apartments/${id}/images`, input);
    return unwrap<Apartment>(data);
  },

  async removeImage(id: string, imageId: string): Promise<Apartment> {
    const { data } = await apiClient.delete(
      `/admin/apartments/${id}/images/${imageId}`,
    );
    return unwrap<Apartment>(data);
  },

  async setCover(id: string, imageId: string): Promise<Apartment> {
    const { data } = await apiClient.patch(
      `/admin/apartments/${id}/images/${imageId}/cover`,
    );
    return unwrap<Apartment>(data);
  },
};
