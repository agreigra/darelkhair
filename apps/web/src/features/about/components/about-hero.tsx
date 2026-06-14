import { useTranslations } from 'next-intl';

/** About page heading band — title + tagline over a teal brand surface. */
export function AboutHero() {
  const t = useTranslations('about');

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          {t('heroTitle')}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-primary-foreground/90">
          {t('heroSubtitle')}
        </p>
      </div>
    </section>
  );
}
