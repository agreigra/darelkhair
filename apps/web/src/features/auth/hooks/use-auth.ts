'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '../types/auth.types';

/** Log in, then store the session. */
export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (session) => setSession(session),
  });
}

/**
 * Register. No auto-login — the API returns `{ verificationRequired, email }`
 * and the user must confirm their email before they can log in.
 */
export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
  });
}

/** Confirm a sign-up email from the verification link. */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: VerifyEmailInput) => authApi.verifyEmail(input),
  });
}

/** Re-send the verification email. */
export function useResendVerification() {
  return useMutation({
    mutationFn: (input: ResendVerificationInput) =>
      authApi.resendVerification(input),
  });
}

/** Request a password-reset email. */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authApi.forgotPassword(input),
  });
}

/** Set a new password from a reset token. */
export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authApi.resetPassword(input),
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
