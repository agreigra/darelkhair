import { setRequestLocale } from 'next-intl/server';
import { BookingDetail } from '@/features/bookings/components/booking-detail';

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <div className="container max-w-5xl py-10">
      <BookingDetail id={id} />
    </div>
  );
}
