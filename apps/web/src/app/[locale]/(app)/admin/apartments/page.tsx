import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { ApartmentsTable } from '@/features/apartments/components/apartments-table';

export default async function AdminApartmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('apartments.table');

  return (
    <div className="container space-y-6 py-10">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Button asChild>
            <Link href="/admin/apartments/new">
              <Plus /> {t('new')}
            </Link>
          </Button>
        }
      />
      <ApartmentsTable />
    </div>
  );
}
