import { z } from 'zod';

type T = (key: string) => string;

/** Required localized field: all three locales must be non-empty. */
function requiredLocalized(t: T) {
  const nonEmpty = z.string().min(1, t('required'));
  return z.object({ fr: nonEmpty, ar: nonEmpty, en: nonEmpty });
}

/** Optional localized field: each locale may be empty. */
function optionalLocalized() {
  const s = z.string().max(4000).optional().or(z.literal(''));
  return z.object({ fr: s, ar: s, en: s });
}

export function createApartmentSchema(t: T) {
  return z.object({
    title: requiredLocalized(t),
    description: optionalLocalized(),
    city: optionalLocalized(),
    address: optionalLocalized(),
    pricePerNight: z.coerce.number().min(0, t('priceInvalid')),
    bedrooms: z.coerce.number().int().min(0).max(50),
    bathrooms: z.coerce.number().int().min(0).max(50),
    maxGuests: z.coerce.number().int().min(1, t('guestsInvalid')).max(100),
    isPublished: z.boolean(),
  });
}

export type ApartmentFormValues = z.infer<ReturnType<typeof createApartmentSchema>>;
