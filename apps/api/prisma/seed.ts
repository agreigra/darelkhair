import { PrismaClient } from '@prisma/client';

/**
 * Baseline seed — intentionally minimal in Phase 0.
 * Feature steps (auth/apartments) will extend this with real fixtures.
 */
const prisma = new PrismaClient();

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
