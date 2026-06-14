import { apiClient, unwrap } from '@/lib/api-client';
import type {
  ContactInfo,
  ContactMessage,
  ContactQuery,
  ContactStatus,
  CreateContactInput,
  PaginatedContactMessages,
} from '../types/contact.types';

export const contactApi = {
  // ── public ──
  async info(): Promise<ContactInfo> {
    const { data } = await apiClient.get('/contact/info');
    return unwrap<ContactInfo>(data);
  },

  async submit(input: CreateContactInput): Promise<ContactMessage> {
    const { data } = await apiClient.post('/contact', input);
    return unwrap<ContactMessage>(data);
  },

  // ── admin ──
  async list(query: ContactQuery): Promise<PaginatedContactMessages> {
    const { data } = await apiClient.get('/contact', {
      params: {
        page: query.page,
        pageSize: query.pageSize,
        search: query.search || undefined,
        status: query.status || undefined,
      },
    });
    return unwrap<PaginatedContactMessages>(data);
  },

  async updateStatus(
    id: string,
    status: ContactStatus,
  ): Promise<ContactMessage> {
    const { data } = await apiClient.patch(`/contact/${id}`, { status });
    return unwrap<ContactMessage>(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/contact/${id}`);
  },
};
