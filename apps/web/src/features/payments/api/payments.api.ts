import { apiClient, unwrap } from '@/lib/api-client';
import type {
  AdminPayment,
  PaginatedPayments,
  Payment,
  PaymentFilters,
  PaymentInstructions,
  SubmitPaymentInput,
} from '../types/payment.types';

export const paymentsApi = {
  // ── public ──
  async instructions(): Promise<PaymentInstructions> {
    const { data } = await apiClient.get('/payments/instructions');
    return unwrap<PaymentInstructions>(data);
  },

  // ── guest ──
  async getForBooking(bookingId: string): Promise<Payment | null> {
    const { data } = await apiClient.get(`/bookings/${bookingId}/payment`);
    return unwrap<Payment | null>(data);
  },

  async submit(
    bookingId: string,
    input: SubmitPaymentInput,
  ): Promise<Payment> {
    const { data } = await apiClient.post(`/bookings/${bookingId}/payment`, input);
    return unwrap<Payment>(data);
  },

  // ── admin ──
  async adminList(filters: PaymentFilters): Promise<PaginatedPayments> {
    const { data } = await apiClient.get('/admin/payments', {
      params: {
        page: filters.page,
        pageSize: filters.pageSize,
        status: filters.status,
      },
    });
    return unwrap<PaginatedPayments>(data);
  },

  async adminGetForBooking(bookingId: string): Promise<AdminPayment | null> {
    const { data } = await apiClient.get(
      `/admin/payments/by-booking/${bookingId}`,
    );
    return unwrap<AdminPayment | null>(data);
  },

  async verify(id: string): Promise<AdminPayment> {
    const { data } = await apiClient.patch(`/admin/payments/${id}/verify`);
    return unwrap<AdminPayment>(data);
  },

  async reject(id: string, note?: string): Promise<AdminPayment> {
    const { data } = await apiClient.patch(`/admin/payments/${id}/reject`, {
      note,
    });
    return unwrap<AdminPayment>(data);
  },
};
