import { useTranslations } from 'next-intl';
import { Target, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/** Mission & Vision statements as two side-by-side cards. */
export function MissionVision() {
  const t = useTranslations('about');

  const blocks = [
    { icon: Target, title: t('missionTitle'), body: t('missionBody') },
    { icon: Eye, title: t('visionTitle'), body: t('visionBody') },
  ];

  return (
    <section className="container py-20">
      <div className="grid gap-6 md:grid-cols-2">
        {blocks.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="shadow-sm">
            <CardContent className="space-y-4 p-8">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="leading-relaxed text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
