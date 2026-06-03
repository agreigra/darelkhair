'use client';

import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LABELS: Record<Locale, string> = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
};

/** Minimal locale switcher. Preserves the current path when switching. */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function onSelect(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- params are passed through unchanged
        { pathname, params },
        { locale: next },
      );
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Globe className="size-4 text-muted-foreground" aria-hidden />
      <div className="flex items-center gap-1" aria-busy={isPending}>
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onSelect(l)}
            className={cn(
              'rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-accent',
              l === locale
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground',
            )}
          >
            {LABELS[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
