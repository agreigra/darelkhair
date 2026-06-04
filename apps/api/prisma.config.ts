import { defineConfig, env } from 'prisma/config';
import path from 'node:path';

/**
 * Prisma 7 config — used by the CLI (generate / migrate / studio / seed).
 * Prisma 7 does NOT auto-load .env, so we load it here. The single shared env
 * file lives at the repo root; a local apps/api/.env (if present) wins.
 * At runtime the app connects via the pg driver adapter (see PrismaService).
 */
for (const candidate of [
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '.env'),
]) {
  try {
    process.loadEnvFile(candidate);
  } catch {
    // File may not exist — ignore and fall through to the next candidate.
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});
