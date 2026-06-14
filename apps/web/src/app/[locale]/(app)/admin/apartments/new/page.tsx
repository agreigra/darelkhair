import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { ApartmentForm } from '@/features/apartments/components/apartment-form';

export default async function NewApartmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('apartments.form');

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <PageHeader
        title={t('createTitle')}
        description={t('createSubtitle')}
        backHref="/admin/apartments"
      />
      <ApartmentForm />
    </div>
  );
}
