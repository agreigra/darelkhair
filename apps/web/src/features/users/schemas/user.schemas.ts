import { z } from 'zod';

type T = (key: string) => string;

export function createProfileSchema(_t: T) {
  return z.object({
    firstName: z.string().max(80).optional().or(z.literal('')),
    lastName: z.string().max(80).optional().or(z.literal('')),
    phone: z.string().max(32).optional().or(z.literal('')),
  });
}

export function createPasswordSchema(t: T) {
  return z.object({
    currentPassword: z.string().min(1, t('passwordRequired')),
    newPassword: z.string().min(8, t('passwordTooShort')).max(72, t('passwordTooLong')),
  });
}

export type ProfileValues = z.infer<ReturnType<typeof createProfileSchema>>;
export type PasswordValues = z.infer<ReturnType<typeof createPasswordSchema>>;
