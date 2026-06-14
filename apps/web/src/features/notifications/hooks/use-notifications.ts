'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { notificationsApi } from '../api/notifications.api';

const NOTIFICATIONS_KEY = ['notifications'];

/**
 * The signed-in user's recent notifications + unread count. Polls in the
 * background so the bell stays fresh; disabled when signed out.
 */
export function useNotifications() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationsApi.list({ page: 1, pageSize: 10 }),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
