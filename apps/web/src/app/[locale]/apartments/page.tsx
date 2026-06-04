import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { ApartmentsBrowse } from '@/features/apartments/components/apartments-browse';

export default async function ApartmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('apartments.browse');

  return (
    <div className="container space-y-6 py-10">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <ApartmentsBrowse />
    </div>
  );
}
