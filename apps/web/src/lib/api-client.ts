import axios, { type AxiosInstance } from 'axios';

/**
 * Shared axios instance for all feature `api/` layers.
 * Auth (Feature 1) will attach the access-token interceptor and refresh logic here.
 */
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/** The API wraps successful payloads as { success, data }. Unwrap to the data. */
export function unwrap<T>(payload: { success: boolean; data: T }): T {
  return payload.data;
}
