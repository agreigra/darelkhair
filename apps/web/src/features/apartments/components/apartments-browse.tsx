'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApartmentCard } from '@/components/shared/apartment-card';
import { localized } from '@/lib/i18n-content';
import { useApartments } from '../hooks/use-apartments';
import type { ApartmentFilters } from '../types/apartment.types';

const PAGE_SIZE = 12;

/** Public apartment browser: search + guests filter + responsive grid + paging. */
export function ApartmentsBrowse() {
  const t = useTranslations('apartments.browse');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [guests, setGuests] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const filters: ApartmentFilters = {
    page,
    pageSize: PAGE_SIZE,
    search: debounced || undefined,
    guests,
  };
  const { data, isLoading, isPlaceholderData } = useApartments(filters);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="ps-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {[undefined, 2, 4, 6].map((g) => (
            <Button
              key={g ?? 'any'}
              size="sm"
              variant={guests === g ? 'default' : 'outline'}
              className="gap-1"
              onClick={() => {
                setGuests(g);
                setPage(1);
              }}
            >
              {g ? (
                <>
                  <Users className="size-3.5" /> {g}+
                </>
              ) : (
                t('anyGuests')
              )}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((apt) => (
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

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1 || isPlaceholderData}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
          <span>{t('pageOf', { page, total: totalPages })}</span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages || isPlaceholderData}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
