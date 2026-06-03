/**
 * Server-side counterpart of the frontend LocalizedText.
 * Localized entity fields (apartment title/description/city…) are stored as
 * JSON shaped { fr, ar, en }. Feature 3 adds a class-validator DTO decorator
 * (e.g. @IsLocalizedText()) that enforces the required locales on input.
 */
export const SUPPORTED_LOCALES = ['fr', 'ar', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalizedText = Partial<Record<SupportedLocale, string>>;

export const DEFAULT_LOCALE: SupportedLocale = 'fr';

/** Resolve a stored LocalizedText to one locale, with fallback. */
export function resolveLocalized(
  value: LocalizedText | null | undefined,
  locale: string,
): string {
  if (!value) return '';
  const active = value[locale as SupportedLocale];
  if (active) return active;
  const fallback = value[DEFAULT_LOCALE];
  if (fallback) return fallback;
  for (const l of SUPPORTED_LOCALES) {
    if (value[l]) return value[l] as string;
  }
  return '';
}

/** True when every supported locale has a non-empty string. */
export function isCompleteLocalizedText(value: unknown): value is LocalizedText {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return SUPPORTED_LOCALES.every(
    (l) => typeof v[l] === 'string' && (v[l] as string).trim().length > 0,
  );
}
