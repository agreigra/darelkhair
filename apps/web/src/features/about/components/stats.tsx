import { useTranslations } from 'next-intl';

/** Key metrics band — apartments, guest rating, happy guests, years. */
export function Stats() {
  const t = useTranslations('about');

  const stats = [
    { value: '20+', label: t('statApartments') },
    { value: '4.9', label: t('statRating') },
    { value: '500+', label: t('statGuests') },
    { value: '3+', label: t('statYears') },
  ];

  return (
    <section className="border-y bg-secondary/40">
      <div className="container grid grid-cols-2 gap-8 py-16 md:grid-cols-4">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-4xl font-semibold tracking-tight text-primary">
              {value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
