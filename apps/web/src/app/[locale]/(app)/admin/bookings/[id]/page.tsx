import { setRequestLocale } from 'next-intl/server';
import { AdminBookingManage } from '@/features/bookings/components/admin-booking-manage';

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <div className="container max-w-5xl py-10">
      <AdminBookingManage id={id} />
    </div>
  );
}
