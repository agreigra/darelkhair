import { apiClient, unwrap } from '@/lib/api-client';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
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

  /** Request a reset link. Always succeeds (no account enumeration). */
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    await apiClient.post('/auth/forgot-password', input);
  },

  /** Set a new password using the token from the emailed reset link. */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await apiClient.post('/auth/reset-password', input);
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
