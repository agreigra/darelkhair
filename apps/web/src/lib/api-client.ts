import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { authToken } from '@/lib/auth-token';
import type { SessionResponse } from '@/features/auth/types/auth.types';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const apiBase = `${baseURL}/api`;

/** Shared axios instance for all feature `api/` layers. */
export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true, // send/receive the httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

/** The API wraps successful payloads as { success, data }. Unwrap to the data. */
export function unwrap<T>(payload: { success: boolean; data: T }): T {
  return payload.data;
}

// ── Attach the in-memory access token to every request ──
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authToken.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Tell the API the active app locale (from <html lang>, set by next-intl) so
  // server-sent emails (verification, password reset) are localized. Browsers
  // forbid overriding Accept-Language, hence a custom header.
  if (typeof document !== 'undefined') {
    const locale = document.documentElement.lang;
    if (locale) config.headers['x-app-locale'] = locale;
  }
  return config;
});

// ── Silent refresh on 401 (single-flight) ──
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
let refreshPromise: Promise<SessionResponse> | null = null;

async function runRefresh(): Promise<SessionResponse> {
  // Bare axios (not apiClient) so this request can't recurse through this interceptor.
  const { data } = await axios.post<{ success: boolean; data: SessionResponse }>(
    `${apiBase}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return data.data;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';

    // Only attempt one refresh, and never for the auth endpoints themselves.
    const isAuthRoute =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/logout');

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? runRefresh();
        const session = await refreshPromise;
        refreshPromise = null;
        authToken.emitRefreshed(session);
        original.headers.Authorization = `Bearer ${session.accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        refreshPromise = null;
        authToken.emitAuthError();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
