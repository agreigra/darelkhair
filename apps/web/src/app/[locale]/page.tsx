import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Hero />;
}

function Hero() {
  const t = useTranslations('home');
  return (
    <section className="container flex flex-col items-center gap-6 py-24 text-center">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
        {t('heroTitle')}
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        {t('heroSubtitle')}
      </p>
      <Button asChild size="lg">
        <Link href="/apartments">{t('browse')}</Link>
      </Button>
    </section>
  );
}
