import { apiClient, unwrap } from '@/lib/api-client';
import type {
  LoginInput,
  RegisterInput,
  SessionResponse,
  User,
} from '../types/auth.types';

/** HTTP layer for the auth feature. All calls hit the NestJS /api/auth routes. */
export const authApi = {
  async register(input: RegisterInput): Promise<SessionResponse> {
    const { data } = await apiClient.post('/auth/register', input);
    return unwrap<SessionResponse>(data);
  },

  async login(input: LoginInput): Promise<SessionResponse> {
    const { data } = await apiClient.post('/auth/login', input);
    return unwrap<SessionResponse>(data);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get('/auth/me');
    return unwrap<User>(data);
  },

  /** Silent refresh — used on app load to restore a session from the cookie. */
  async refresh(): Promise<SessionResponse> {
    const { data } = await apiClient.post('/auth/refresh');
    return unwrap<SessionResponse>(data);
  },
};
