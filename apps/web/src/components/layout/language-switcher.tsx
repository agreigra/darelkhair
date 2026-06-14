'use client';

import { useLocale, useTranslations } from 'next-intl';
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
  const [isPending, startTransition] = useTransition();

  function onSelect(next: Locale) {
    if (next === locale) return;
    // Soft, client-side navigation to the same path under the new locale. This
    // keeps the React tree alive so the in-memory access token survives — a hard
    // reload would drop it and force a refresh that Safari/iOS blocks on a
    // split web/API domain (third-party cookie), signing the user out.
    startTransition(() => {
      router.replace(pathname, { locale: next });
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
