'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { contactApi } from '../api/contact.api';
import type {
  ContactQuery,
  ContactStatus,
  CreateContactInput,
} from '../types/contact.types';

/** Public contact details (address / phone / email / WhatsApp). */
export function useContactInfo() {
  return useQuery({
    queryKey: ['contact', 'info'],
    queryFn: () => contactApi.info(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Public "Send us a message" submission. */
export function useSubmitContact() {
  return useMutation({
    mutationFn: (input: CreateContactInput) => contactApi.submit(input),
  });
}

/** Admin: paginated contact inbox. Keeps the previous page while loading. */
export function useContactMessages(query: ContactQuery) {
  return useQuery({
    queryKey: ['contact-messages', query],
    queryFn: () => contactApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactStatus }) =>
      contactApi.updateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    },
  });
}
