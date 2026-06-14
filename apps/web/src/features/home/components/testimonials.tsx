import { useTranslations } from 'next-intl';
import { Quote, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/** "What our guests say" — guest testimonials with 5-star ratings. */
export function Testimonials() {
  const t = useTranslations('home');

  const items = [1, 2, 3].map((n) => ({
    quote: t(`testimonial${n}Quote`),
    name: t(`testimonial${n}Name`),
    location: t(`testimonial${n}Location`),
  }));

  return (
    <section className="border-y bg-secondary/40">
      <div className="container py-20">
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight">
          {t('testimonialsTitle')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map(({ quote, name, location }) => (
            <Card key={name} className="bg-card shadow-sm">
              <CardContent className="flex h-full flex-col gap-4 p-8">
                <Quote className="size-8 text-brand-gold" />
                <p className="flex-1 text-pretty leading-relaxed text-foreground/90">
                  {quote}
                </p>
                <div className="flex gap-0.5 text-brand-orange">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">{location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
