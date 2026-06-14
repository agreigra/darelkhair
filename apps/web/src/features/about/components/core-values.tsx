import { useTranslations } from 'next-intl';
import { Award, HeartHandshake, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/** Three core-value pillars: Excellence, Hospitality, Innovation. */
export function CoreValues() {
  const t = useTranslations('about');

  const values = [
    { icon: Award, title: t('value1Title'), body: t('value1Body') },
    { icon: HeartHandshake, title: t('value2Title'), body: t('value2Body') },
    { icon: Lightbulb, title: t('value3Title'), body: t('value3Body') },
  ];

  return (
    <section className="border-y bg-secondary/40">
      <div className="container py-20">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            {t('valuesTitle')}
          </h2>
          <p className="text-muted-foreground">{t('valuesSubtitle')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="border-none bg-card shadow-sm">
              <CardContent className="space-y-3 p-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
