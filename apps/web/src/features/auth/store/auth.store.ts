import { create } from 'zustand';
import { authToken } from '@/lib/auth-token';
import type { SessionResponse, User } from '../types/auth.types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  /** Set the session after login/register/refresh. Mirrors the token to lib. */
  setSession: (session: SessionResponse) => void;
  setUser: (user: User) => void;
  /** Mark the session resolved-but-anonymous (no valid cookie). */
  setUnauthenticated: () => void;
  clear: () => void;
}

/**
 * Auth/session store. The access token is kept in memory (lib/auth-token), not
 * persisted — on reload the app silently refreshes from the httpOnly cookie.
 * `status` starts as 'loading' until the initial refresh resolves.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  setSession: (session) => {
    authToken.set(session.accessToken);
    set({ user: session.user, status: 'authenticated' });
  },
  setUser: (user) => set({ user, status: 'authenticated' }),
  setUnauthenticated: () => {
    authToken.set(null);
    set({ user: null, status: 'unauthenticated' });
  },
  clear: () => {
    authToken.set(null);
    set({ user: null, status: 'unauthenticated' });
  },
}));
