import type { SessionResponse } from '@/features/auth/types/auth.types';

/**
 * Decoupling layer between the axios client (shared infra) and the auth feature.
 * The access token lives in memory here; the API client reads it and runs the
 * silent-refresh flow. The auth feature registers callbacks so its Zustand store
 * stays in sync — this keeps `lib/` from importing the feature's store directly.
 */
let accessToken: string | null = null;
let onRefreshed: ((session: SessionResponse) => void) | null = null;
let onAuthError: (() => void) | null = null;

export const authToken = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
  /** Called by the API client after a successful silent refresh. */
  registerOnRefreshed: (cb: (session: SessionResponse) => void): void => {
    onRefreshed = cb;
  },
  /** Called by the API client when refresh fails (session is dead). */
  registerOnAuthError: (cb: () => void): void => {
    onAuthError = cb;
  },
  emitRefreshed: (session: SessionResponse): void => {
    accessToken = session.accessToken;
    onRefreshed?.(session);
  },
  emitAuthError: (): void => {
    accessToken = null;
    onAuthError?.();
  },
};
