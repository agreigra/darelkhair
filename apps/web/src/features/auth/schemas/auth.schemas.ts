import { z } from 'zod';

/** Translator for validation messages (keys under the `auth.errors` namespace). */
type T = (key: string) => string;

/**
 * Schemas are built per-render with a translator so validation messages are
 * localized (FR/AR/EN). The optional text fields accept empty strings.
 */
export function createLoginSchema(t: T) {
  return z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(1, t('passwordRequired')),
  });
}

export function createRegisterSchema(t: T) {
  return z.object({
    firstName: z.string().max(80).optional().or(z.literal('')),
    lastName: z.string().max(80).optional().or(z.literal('')),
    email: z.string().email(t('invalidEmail')),
    phone: z.string().max(32).optional().or(z.literal('')),
    password: z
      .string()
      .min(8, t('passwordTooShort'))
      .max(72, t('passwordTooLong')),
  });
}

export function createForgotPasswordSchema(t: T) {
  return z.object({
    email: z.string().email(t('invalidEmail')),
  });
}

export function createResetPasswordSchema(t: T) {
  return z.object({
    password: z
      .string()
      .min(8, t('passwordTooShort'))
      .max(72, t('passwordTooLong')),
  });
}

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterValues = z.infer<ReturnType<typeof createRegisterSchema>>;
export type ForgotPasswordValues = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;
export type ResetPasswordValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
