'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApartmentCard } from '@/components/shared/apartment-card';
import { localized } from '@/lib/i18n-content';
import { useApartments } from '@/features/apartments/hooks/use-apartments';

/**
 * Featured apartments strip — reuses the public listing query + the shared
 * ApartmentCard so the home page always shows real, published inventory.
 */
export function FeaturedApartments() {
  const t = useTranslations('home');
  const locale = useLocale();
  const { data, isLoading } = useApartments({ page: 1, pageSize: 6 });
  const items = data?.items ?? [];

  return (
    <section className="container py-20">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">
            {t('featuredTitle')}
          </h2>
          <p className="max-w-xl text-muted-foreground">
            {t('featuredSubtitle')}
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 self-start">
          <Link href="/apartments">
            {t('featuredViewAll')}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {t('featuredEmpty')}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((apt) => (
            <ApartmentCard
              key={apt.id}
              apartment={{
                id: apt.id,
                title: localized(apt.title, locale),
                city: apt.city ? localized(apt.city, locale) : null,
                pricePerNight: apt.pricePerNight,
                bedrooms: apt.bedrooms,
                bathrooms: apt.bathrooms,
                maxGuests: apt.maxGuests,
                coverImageUrl: apt.coverImageUrl,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
