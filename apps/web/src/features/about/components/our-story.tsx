import Image from 'next/image';
import { useTranslations } from 'next-intl';

/** "Our story" — narrative paragraphs alongside a building image. */
export function OurStory() {
  const t = useTranslations('about');

  return (
    <section className="container py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight">
            {t('storyTitle')}
          </h2>
          <p className="leading-relaxed text-muted-foreground">{t('storyP1')}</p>
          <p className="leading-relaxed text-muted-foreground">{t('storyP2')}</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm">
          <Image
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
