import { useTranslations } from 'next-intl';
import { Search, CalendarCheck, KeyRound } from 'lucide-react';

/** Three-step "How it works" — Browse → Book → Stay. */
export function HowItWorks() {
  const t = useTranslations('home');

  const steps = [
    { icon: Search, title: t('step1Title'), body: t('step1Body') },
    { icon: CalendarCheck, title: t('step2Title'), body: t('step2Body') },
    { icon: KeyRound, title: t('step3Title'), body: t('step3Body') },
  ];

  return (
    <section id="how-it-works" className="container scroll-mt-20 py-20">
      <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          {t('howTitle')}
        </h2>
        <p className="text-muted-foreground">{t('howSubtitle')}</p>
      </div>
      <div className="grid gap-10 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-7" />
              </div>
              <span className="absolute -end-1 -top-1 flex size-7 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-brand-orange-foreground">
                {i + 1}
              </span>
            </div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
