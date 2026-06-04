'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { authToken } from '@/lib/auth-token';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';

/**
 * Boots the auth session on the client:
 *  - wires the API client's refresh/auth-error callbacks into the store
 *  - attempts a silent refresh from the httpOnly cookie on first load
 * Keeps the access token out of localStorage (memory-only, refreshed on reload).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);
  const didInit = useRef(false);

  useEffect(() => {
    authToken.registerOnRefreshed((session) => setSession(session));
    authToken.registerOnAuthError(() => setUnauthenticated());

    if (didInit.current) return;
    didInit.current = true;

    authApi
      .refresh()
      .then((session) => setSession(session))
      .catch(() => setUnauthenticated());
  }, [setSession, setUnauthenticated]);

  return <>{children}</>;
}
