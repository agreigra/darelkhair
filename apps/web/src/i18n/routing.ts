import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

/** Locales that render right-to-left. Drives the <html dir> attribute. */
export const rtlLocales: readonly Locale[] = ['ar'];

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

/** Type guard: is the given string one of our supported locales? */
export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

export function getDirection(locale: string): 'rtl' | 'ltr' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
});
