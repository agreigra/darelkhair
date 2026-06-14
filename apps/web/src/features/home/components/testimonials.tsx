'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Quote, Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { localized } from '@/lib/i18n-content';
import { StarRating, useFeaturedReviews } from '@/features/reviews';

/**
 * "What our guests say" — surfaces real recent, highly-rated reviews when they
 * exist (Bug 10), gracefully falling back to the curated i18n testimonials
 * while loading or when there are no reviews yet.
 */
export function Testimonials() {
  const t = useTranslations('home');
  const locale = useLocale();
  const { data } = useFeaturedReviews();
  const reviews = (data ?? []).slice(0, 6);

  return (
    <section className="border-y bg-secondary/40">
      <div className="container py-20">
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight">
          {t('testimonialsTitle')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.length > 0
            ? reviews.map((r) => (
                <Card key={r.id} className="bg-card shadow-sm">
                  <CardContent className="flex h-full flex-col gap-4 p-8">
                    <Quote className="size-8 text-brand-gold" />
                    <p className="flex-1 text-pretty leading-relaxed text-foreground/90">
                      “{r.comment}”
                    </p>
                    <StarRating value={r.rating} size="sm" />
                    <div>
                      <p className="font-semibold">{r.authorName}</p>
                      {r.apartmentTitle ? (
                        <Link
                          href={`/apartments/${r.apartmentId}`}
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {localized(r.apartmentTitle, locale)}
                        </Link>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            : [1, 2, 3].map((n) => (
                <Card key={n} className="bg-card shadow-sm">
                  <CardContent className="flex h-full flex-col gap-4 p-8">
                    <Quote className="size-8 text-brand-gold" />
                    <p className="flex-1 text-pretty leading-relaxed text-foreground/90">
                      {t(`testimonial${n}Quote`)}
                    </p>
                    <div className="flex gap-0.5 text-brand-orange">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold">{t(`testimonial${n}Name`)}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`testimonial${n}Location`)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );
}
