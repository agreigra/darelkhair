'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apartmentsApi } from '../api/apartments.api';
import type {
  ApartmentFilters,
  ApartmentImageInput,
  CreateApartmentInput,
  UpdateApartmentInput,
} from '../types/apartment.types';

export function useAdminApartments(filters: ApartmentFilters) {
  return useQuery({
    queryKey: ['admin-apartments', filters],
    queryFn: () => apartmentsApi.adminList(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminApartment(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-apartment', id],
    queryFn: () => apartmentsApi.adminGet(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateApartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApartmentInput) => apartmentsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-apartments'] }),
  });
}

export function useUpdateApartment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateApartmentInput) => apartmentsApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-apartments'] });
      void qc.invalidateQueries({ queryKey: ['admin-apartment', id] });
    },
  });
}

export function useDeleteApartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apartmentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-apartments'] }),
  });
}

/** Image mutations write the updated apartment back into the detail cache. */
export function useApartmentImages(id: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['admin-apartment', id] });

  const addImage = useMutation({
    mutationFn: (input: ApartmentImageInput) => apartmentsApi.addImage(id, input),
    onSuccess: invalidate,
  });
  const uploadImage = useMutation({
    mutationFn: (file: File) => apartmentsApi.uploadImage(id, file),
    onSuccess: invalidate,
  });
  const removeImage = useMutation({
    mutationFn: (imageId: string) => apartmentsApi.removeImage(id, imageId),
    onSuccess: invalidate,
  });
  const setCover = useMutation({
    mutationFn: (imageId: string) => apartmentsApi.setCover(id, imageId),
    onSuccess: invalidate,
  });

  return { addImage, uploadImage, removeImage, setCover };
}
