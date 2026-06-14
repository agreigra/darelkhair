'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useContactInfo } from '../hooks/use-contact';

/** Contact details column — address, phone, email, hours, WhatsApp link. */
export function ContactInfo() {
  const t = useTranslations('contact');
  const { data, isLoading } = useContactInfo();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('infoTitle')}
        </h2>
        <p className="mt-1 text-muted-foreground">{t('infoSubtitle')}</p>
      </div>

      {isLoading || !data ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <ul className="space-y-5">
          <InfoRow icon={MapPin} label={t('labels.address')} value={data.address} />
          <InfoRow
            icon={Phone}
            label={t('labels.phone')}
            value={data.phone}
            href={`tel:${data.phone.replace(/\s+/g, '')}`}
          />
          <InfoRow
            icon={Mail}
            label={t('labels.email')}
            value={data.email}
            href={`mailto:${data.email}`}
          />
          <InfoRow icon={Clock} label={t('labels.hours')} value={t('hoursValue')} />
          {data.whatsappNumber ? (
            <InfoRow
              icon={MessageCircle}
              label={t('labels.whatsapp')}
              value={t('whatsappValue')}
              href={`https://wa.me/${data.whatsappNumber}`}
            />
          ) : null}
        </ul>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="font-medium transition-colors hover:text-primary"
          >
            {value}
          </a>
        ) : (
          <p className="font-medium">{value}</p>
        )}
      </div>
    </li>
  );
}
