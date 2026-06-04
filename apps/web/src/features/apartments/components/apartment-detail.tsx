'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { BedDouble, Bath, Users, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { localized } from '@/lib/i18n-content';
import { AvailabilityCalendar } from '@/features/availability/components/availability-calendar';
import { useApartment } from '../hooks/use-apartments';

export function ApartmentDetail({ id }: { id: string }) {
  const t = useTranslations('apartments.detail');
  const locale = useLocale();
  const { data: apt, isLoading, isError } = useApartment(id);
  const [active, setActive] = useState(0);

  if (isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !apt) {
    return (
      <p className="py-16 text-center text-muted-foreground">{t('notFound')}</p>
    );
  }

  const title = localized(apt.title, locale);
  const description = apt.description ? localized(apt.description, locale) : '';
  const city = apt.city ? localized(apt.city, locale) : '';
  const address = apt.address ? localized(apt.address, locale) : '';
  const images = apt.images.length
    ? apt.images
    : apt.coverImageUrl
      ? [{ id: 'cover', url: apt.coverImageUrl, alt: title }]
      : [];
  const activeImage = images[active] ?? images[0];

  const specs = [
    { icon: BedDouble, label: t('bedrooms', { count: apt.bedrooms }) },
    { icon: Bath, label: t('bathrooms', { count: apt.bathrooms }) },
    { icon: Users, label: t('guests', { count: apt.maxGuests }) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            {activeImage ? (
              <Image
                src={activeImage.url}
                alt={activeImage.alt ?? title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    'relative size-20 shrink-0 overflow-hidden rounded-md border-2',
                    i === active ? 'border-primary' : 'border-transparent',
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? ''}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Booking / price card */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold">
                  {apt.pricePerNight}
                </span>
                <span className="text-muted-foreground">{t('perNight')}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {specs.map((s) => (
                  <span key={s.label} className="flex items-center gap-1.5">
                    <s.icon className="size-4" /> {s.label}
                  </span>
                ))}
              </div>
              {/* TODO(Feature 5): wire the booking flow to this CTA. */}
              <Button className="w-full" size="lg">
                {t('book')}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {t('bookHint')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info */}
      <div className="max-w-3xl space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {(city || address) && (
            <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" />
              {[address, city].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        {description ? (
          <p className="whitespace-pre-line leading-relaxed text-foreground/90">
            {description}
          </p>
        ) : null}
      </div>

      {/* Availability */}
      <div className="max-w-3xl space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {t('availabilityTitle')}
        </h2>
        <AvailabilityCalendar
          apartmentId={apt.id}
          pricePerNight={apt.pricePerNight}
        />
      </div>
    </div>
  );
}
