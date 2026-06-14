'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LABELS: Record<Locale, string> = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
};

/** Locale switcher as a dropdown. Preserves the current path when switching. */
export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('common');
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          aria-label={t('language')}
          aria-busy={isPending}
        >
          <Globe className="size-4" />
          <span className="hidden sm:inline">{LABELS[locale as Locale]}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => onSelect(l)}
            className="justify-between gap-4"
          >
            {LABELS[l]}
            {l === locale ? <Check className="size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
