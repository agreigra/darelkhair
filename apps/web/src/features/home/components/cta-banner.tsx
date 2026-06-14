import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

/** Closing call-to-action banner before the footer. */
export function CtaBanner() {
  const t = useTranslations('home');

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container flex flex-col items-center gap-6 py-20 text-center">
        <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('ctaTitle')}
        </h2>
        <p className="max-w-xl text-primary-foreground/90">{t('ctaSubtitle')}</p>
        <Button
          asChild
          size="lg"
          className="bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90"
        >
          <Link href="/apartments">{t('ctaButton')}</Link>
        </Button>
      </div>
    </section>
  );
}
