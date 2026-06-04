import { setRequestLocale } from 'next-intl/server';
import { ApartmentDetail } from '@/features/apartments/components/apartment-detail';

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <div className="container py-10">
      <ApartmentDetail id={id} />
    </div>
  );
}
