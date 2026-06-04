import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

/**
 * Seed baseline accounts for local development:
 *  - an ADMIN (admin@darelkhair.xyz / Admin12345)
 *  - a regular USER (user@darelkhair.xyz / User12345)
 *  - a few extra users so the admin table has rows to page through.
 * Idempotent: re-running upserts the same accounts.
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

async function upsertUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
}): Promise<void> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.user.upsert({
    where: { email: input.email },
    update: { firstName: input.firstName, lastName: input.lastName, role: input.role },
    create: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
    },
  });
}

async function main(): Promise<void> {
  await upsertUser({
    email: 'admin@darelkhair.xyz',
    password: 'Admin12345',
    firstName: 'Admin',
    lastName: 'DarElKhair',
    role: 'ADMIN',
  });
  await upsertUser({
    email: 'user@darelkhair.xyz',
    password: 'User12345',
    firstName: 'Sample',
    lastName: 'User',
    role: 'USER',
  });
  for (let i = 1; i <= 5; i++) {
    await upsertUser({
      email: `guest${i}@darelkhair.xyz`,
      password: 'Guest12345',
      firstName: `Guest${i}`,
      lastName: 'Visitor',
      role: 'USER',
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete: admin@darelkhair.xyz / Admin12345, user@darelkhair.xyz / User12345 (+5 guests).');
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
