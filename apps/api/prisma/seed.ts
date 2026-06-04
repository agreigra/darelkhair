import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Baseline seed — intentionally minimal in Phase 0.
 * Feature steps (auth/apartments) will extend this with real fixtures.
 * Prisma 7 connects via a driver adapter, so we build one from DATABASE_URL.
 */
for (const candidate of [
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '.env'),
]) {
  try {
    process.loadEnvFile(candidate);
  } catch {
    // File may not exist — try the next candidate.
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set — cannot seed.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

async function main(): Promise<void> {
  // Placeholder: nothing seeded yet. Kept so `prisma db seed` is wired and
  // ready for feature work to plug fixtures into.
  // eslint-disable-next-line no-console
  console.log('Seed complete (baseline — no fixtures yet).');
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
