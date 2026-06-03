import { locales, defaultLocale, type Locale } from '@/i18n/routing';

/**
 * Localized entity text as stored in the DB (apartment title/description/city…).
 * Shape: { fr, ar, en }. All locales present after admin entry; we still guard
 * against missing values at render time with a fallback chain.
 */
export type LocalizedText = Partial<Record<Locale, string>>;

/**
 * Resolve a LocalizedText to a single string for the active locale.
 * Falls back to the default locale, then to the first available value.
 * Feature `api`/`hooks` layers call this before passing strings to the
 * shared, locale-agnostic components (ApartmentCard, etc.).
 */
export function localized(
  value: LocalizedText | null | undefined,
  locale: string,
): string {
  if (!value) return '';
  const active = value[locale as Locale];
  if (active) return active;

  const fallback = value[defaultLocale];
  if (fallback) return fallback;

  for (const l of locales) {
    const v = value[l];
    if (v) return v;
  }
  return '';
}

/** Build an empty LocalizedText with every locale keyed — handy for form state. */
export function emptyLocalizedText(): Record<Locale, string> {
  return locales.reduce(
    (acc, l) => {
      acc[l] = '';
      return acc;
    },
    {} as Record<Locale, string>,
  );
}
