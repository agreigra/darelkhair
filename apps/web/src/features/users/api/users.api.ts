import { apiClient, unwrap } from '@/lib/api-client';
import type {
  AdminUpdateInput,
  ChangePasswordInput,
  ManagedUser,
  PaginatedUsers,
  UpdateProfileInput,
  UsersQuery,
} from '../types/user.types';

export const usersApi = {
  async getProfile(): Promise<ManagedUser> {
    const { data } = await apiClient.get('/users/me');
    return unwrap<ManagedUser>(data);
  },

  async updateProfile(input: UpdateProfileInput): Promise<ManagedUser> {
    const { data } = await apiClient.patch('/users/me', input);
    return unwrap<ManagedUser>(data);
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await apiClient.patch('/users/me/password', input);
  },

  // ── admin ──

  async list(query: UsersQuery): Promise<PaginatedUsers> {
    const { data } = await apiClient.get('/users', {
      params: {
        page: query.page,
        pageSize: query.pageSize,
        search: query.search || undefined,
        role: query.role || undefined,
      },
    });
    return unwrap<PaginatedUsers>(data);
  },

  async adminUpdate(id: string, input: AdminUpdateInput): Promise<ManagedUser> {
    const { data } = await apiClient.patch(`/users/${id}`, input);
    return unwrap<ManagedUser>(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
