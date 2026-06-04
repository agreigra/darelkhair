'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import type { LoginInput, RegisterInput } from '../types/auth.types';

/** Log in, then store the session. */
export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (session) => setSession(session),
  });
}

/** Register, then store the session (auto-login). */
export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (session) => setSession(session),
  });
}

/** Log out, clear the session and any cached queries. */
export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}

/**
 * Convenience selector for components. Wrapped in `useShallow` so the derived
 * object is compared shallowly — otherwise a new object each render trips
 * useSyncExternalStore's snapshot caching ("infinite loop" warning).
 */
export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      status: s.status,
      isAuthenticated: s.status === 'authenticated',
      isAdmin: s.user?.role === 'ADMIN',
    })),
  );
}
