import { AxiosError } from 'axios';

interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}

/** Pull a human-readable message out of an axios error, with a fallback. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError && error.response?.data) {
    const body = error.response.data as Partial<ApiErrorBody>;
    if (Array.isArray(body.message)) return body.message[0] ?? fallback;
    if (typeof body.message === 'string') return body.message;
  }
  return fallback;
}

/** HTTP status from an axios error, or undefined. */
export function getApiErrorStatus(error: unknown): number | undefined {
  return error instanceof AxiosError ? error.response?.status : undefined;
}
