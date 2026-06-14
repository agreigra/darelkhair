import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

/**
 * Full-bleed landing hero (Feature 10) — luxury apartment backdrop with a
 * teal-tinted overlay, headline, subtitle and the primary "Discover" CTA.
 * Mirrors darelkhair.xyz: a large image + a single confident call to action.
 */
export function Hero() {
  const t = useTranslations('home');

  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* Brand teal wash for legibility + warmth. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/85" />

      <div className="container flex min-h-[78vh] flex-col items-center justify-center gap-6 py-24 text-center text-primary-foreground">
        <span className="rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1 text-xs font-medium uppercase tracking-widest backdrop-blur">
          {t('heroEyebrow')}
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight drop-shadow-sm sm:text-5xl md:text-6xl">
          {t('heroTitle')}
        </h1>
        <p className="max-w-xl text-pretty text-lg text-primary-foreground/90">
          {t('heroSubtitle')}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90"
          >
            <Link href="/apartments">{t('heroCta')}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="#how-it-works">{t('heroSecondaryCta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
