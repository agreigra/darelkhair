'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { usersApi } from '../api/users.api';
import type {
  ChangePasswordInput,
  UpdateProfileInput,
} from '../types/user.types';

const PROFILE_KEY = ['profile'] as const;

/** Current user's full profile. */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => usersApi.getProfile(),
  });
}

/** Update own profile; keeps the auth-store user (header) in sync. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => usersApi.updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData(PROFILE_KEY, user);
      setUser(user);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => usersApi.changePassword(input),
  });
}
