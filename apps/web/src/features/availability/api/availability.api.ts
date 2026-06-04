import { apiClient, unwrap } from '@/lib/api-client';
import type {
  AvailabilityCheckResult,
  AvailabilitySlot,
  UnavailableRange,
} from '../types/availability.types';

export const availabilityApi = {
  // ── public ──
  async getUnavailable(
    apartmentId: string,
    from: string,
    to: string,
  ): Promise<UnavailableRange[]> {
    const { data } = await apiClient.get(
      `/apartments/${apartmentId}/availability`,
      { params: { from, to } },
    );
    return unwrap<UnavailableRange[]>(data);
  },

  async check(
    apartmentId: string,
    checkIn: string,
    checkOut: string,
  ): Promise<AvailabilityCheckResult> {
    const { data } = await apiClient.get(
      `/apartments/${apartmentId}/availability/check`,
      { params: { checkIn, checkOut } },
    );
    return unwrap<AvailabilityCheckResult>(data);
  },

  // ── admin ──
  async listSlots(apartmentId: string): Promise<AvailabilitySlot[]> {
    const { data } = await apiClient.get(
      `/admin/apartments/${apartmentId}/availability`,
    );
    return unwrap<AvailabilitySlot[]>(data);
  },

  async createBlock(
    apartmentId: string,
    startDate: string,
    endDate: string,
  ): Promise<AvailabilitySlot> {
    const { data } = await apiClient.post(
      `/admin/apartments/${apartmentId}/availability`,
      { startDate, endDate },
    );
    return unwrap<AvailabilitySlot>(data);
  },

  async deleteSlot(apartmentId: string, slotId: string): Promise<void> {
    await apiClient.delete(
      `/admin/apartments/${apartmentId}/availability/${slotId}`,
    );
  },
};
