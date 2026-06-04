import { z } from 'zod';

/**
 * Single source of truth for environment configuration.
 * Validated once at boot — the app refuses to start with an invalid env.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // ── File storage ──
  // 'local' serves files from disk (dev); 'r2' uploads to Cloudflare R2.
  STORAGE_DRIVER: z.enum(['local', 'r2']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(5),
  // Absolute base URL of this API — used to build public URLs for local files.
  API_PUBLIC_URL: z.string().url().default('http://localhost:4000'),

  // Cloudflare R2 (required only when STORAGE_DRIVER=r2)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  // Public base URL the bucket is served from (r2.dev domain or a custom domain).
  R2_PUBLIC_URL: z.string().url().optional(),

  // ── Offline payment instructions (Feature 6) ──
  // Shown to guests on the payment page. Dev defaults are placeholders.
  PAYMENT_BANK_NAME: z.string().default('DarElKhair Bank'),
  PAYMENT_BANK_ACCOUNT_NAME: z.string().default('DarElKhair SARL'),
  PAYMENT_BANK_ACCOUNT_NUMBER: z.string().default('000123456789'),
  PAYMENT_BANK_IBAN: z.string().optional(),
  PAYMENT_MOBILE_MONEY_NUMBER: z.string().default('22200000000'),
  // International format, no '+'. Reused for the WhatsApp support link.
  PAYMENT_WHATSAPP_NUMBER: z.string().default('22200000000'),
})
  .refine(
    (env) =>
      env.STORAGE_DRIVER !== 'r2' ||
      Boolean(
        env.R2_ACCOUNT_ID &&
          env.R2_ACCESS_KEY_ID &&
          env.R2_SECRET_ACCESS_KEY &&
          env.R2_BUCKET &&
          env.R2_PUBLIC_URL,
      ),
    {
      message:
        'STORAGE_DRIVER=r2 requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, and R2_PUBLIC_URL',
      path: ['STORAGE_DRIVER'],
    },
  );

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
