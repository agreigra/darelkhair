import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { AdminApartmentEdit } from '@/features/apartments/components/admin-apartment-edit';

export default async function EditApartmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('apartments.form');

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <PageHeader
        title={t('editTitle')}
        description={t('editSubtitle')}
        backHref="/admin/apartments"
      />
      <AdminApartmentEdit id={id} />
    </div>
  );
}
