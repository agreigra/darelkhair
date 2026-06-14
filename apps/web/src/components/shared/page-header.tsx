import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/** Consistent page title + optional description/actions for app pages. */
export function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** When set, renders a back link above the title (detail/edit pages). */
  backHref?: string;
  /** Label for the back link; defaults to the shared "Back" string. */
  backLabel?: string;
}) {
  const t = useTranslations('common');

  return (
    <div className="space-y-2">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
          {backLabel ?? t('back')}
        </Link>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
