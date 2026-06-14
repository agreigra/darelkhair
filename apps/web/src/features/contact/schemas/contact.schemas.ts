import { z } from 'zod';

/** Translator for validation messages (keys under the `contact.errors` namespace). */
type T = (key: string) => string;

/** Built per-render with a translator so validation messages are localized. */
export function createContactSchema(t: T) {
  return z.object({
    name: z.string().min(2, t('nameRequired')).max(120),
    email: z.string().email(t('invalidEmail')).max(160),
    subject: z.string().min(2, t('subjectRequired')).max(160),
    message: z.string().min(10, t('messageTooShort')).max(5000),
  });
}

export type ContactValues = z.infer<ReturnType<typeof createContactSchema>>;
