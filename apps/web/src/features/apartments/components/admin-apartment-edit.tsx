'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { AdminAvailabilityManager } from '@/features/availability/components/admin-availability-manager';
import { useAdminApartment } from '../hooks/use-admin-apartments';
import { ApartmentForm } from './apartment-form';
import { ApartmentImages } from './apartment-images';

/** Edit screen body: loads the apartment, then renders the form + image manager. */
export function AdminApartmentEdit({ id }: { id: string }) {
  const t = useTranslations('apartments.form');
  const { data: apartment, isLoading, isError } = useAdminApartment(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !apartment) {
    return <p className="text-muted-foreground">{t('notFound')}</p>;
  }

  return (
    <div className="space-y-6">
      <ApartmentForm apartment={apartment} />
      <ApartmentImages apartmentId={apartment.id} images={apartment.images} />
      <AdminAvailabilityManager apartmentId={apartment.id} />
    </div>
  );
}
