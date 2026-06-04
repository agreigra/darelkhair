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

interface ApartmentSeed {
  title: { fr: string; ar: string; en: string };
  description: { fr: string; ar: string; en: string };
  city: { fr: string; ar: string; en: string };
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  isPublished: boolean;
  imageSeeds: string[];
}

const APARTMENTS: ApartmentSeed[] = [
  {
    title: {
      fr: 'Appartement vue mer',
      ar: 'شقة بإطلالة على البحر',
      en: 'Sea-view apartment',
    },
    description: {
      fr: 'Lumineux appartement avec balcon donnant sur l’océan, proche du centre.',
      ar: 'شقة مشرقة بشرفة تطل على المحيط، قريبة من المركز.',
      en: 'Bright apartment with a balcony overlooking the ocean, near the center.',
    },
    city: { fr: 'Nouakchott', ar: 'نواكشوط', en: 'Nouakchott' },
    pricePerNight: 65,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    isPublished: true,
    imageSeeds: ['seaview1', 'seaview2', 'seaview3'],
  },
  {
    title: {
      fr: 'Studio cosy au centre-ville',
      ar: 'استوديو مريح في وسط المدينة',
      en: 'Cosy downtown studio',
    },
    description: {
      fr: 'Studio moderne idéal pour un séjour professionnel ou en couple.',
      ar: 'استوديو عصري مثالي لإقامة عمل أو لشخصين.',
      en: 'Modern studio, ideal for a business stay or a couple.',
    },
    city: { fr: 'Nouadhibou', ar: 'نواذيبو', en: 'Nouadhibou' },
    pricePerNight: 38,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    isPublished: true,
    imageSeeds: ['studio1', 'studio2'],
  },
  {
    title: {
      fr: 'Villa familiale avec jardin',
      ar: 'فيلا عائلية مع حديقة',
      en: 'Family villa with garden',
    },
    description: {
      fr: 'Grande villa de 4 chambres avec jardin privé et parking.',
      ar: 'فيلا كبيرة من 4 غرف نوم مع حديقة خاصة وموقف سيارات.',
      en: 'Large 4-bedroom villa with a private garden and parking.',
    },
    city: { fr: 'Nouakchott', ar: 'نواكشوط', en: 'Nouakchott' },
    pricePerNight: 120,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    isPublished: true,
    imageSeeds: ['villa1', 'villa2', 'villa3'],
  },
  {
    title: {
      fr: 'Appartement moderne 3 pièces',
      ar: 'شقة عصرية من 3 غرف',
      en: 'Modern 3-room apartment',
    },
    description: {
      fr: 'Récemment rénové, proche des commerces et des transports.',
      ar: 'تم تجديدها حديثًا، قريبة من المتاجر ووسائل النقل.',
      en: 'Recently renovated, close to shops and transport.',
    },
    city: { fr: 'Rosso', ar: 'روصو', en: 'Rosso' },
    pricePerNight: 52,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 5,
    isPublished: true,
    imageSeeds: ['modern1', 'modern2'],
  },
  {
    title: {
      fr: 'Penthouse de luxe',
      ar: 'بنتهاوس فاخر',
      en: 'Luxury penthouse',
    },
    description: {
      fr: 'Penthouse haut de gamme avec terrasse panoramique.',
      ar: 'بنتهاوس راقٍ مع تراس بانورامي.',
      en: 'High-end penthouse with a panoramic terrace.',
    },
    city: { fr: 'Nouakchott', ar: 'نواكشوط', en: 'Nouakchott' },
    pricePerNight: 200,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    isPublished: true,
    imageSeeds: ['penthouse1', 'penthouse2'],
  },
  {
    title: {
      fr: 'Chambre d’hôte (brouillon)',
      ar: 'غرفة ضيافة (مسودة)',
      en: 'Guest room (draft)',
    },
    description: {
      fr: 'Annonce en cours de préparation.',
      ar: 'إعلان قيد الإعداد.',
      en: 'Listing being prepared.',
    },
    city: { fr: 'Atar', ar: 'أطار', en: 'Atar' },
    pricePerNight: 30,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    isPublished: false,
    imageSeeds: ['guest1'],
  },
];

async function seedApartments(): Promise<void> {
  const existing = await prisma.apartment.count();
  if (existing > 0) {
    // eslint-disable-next-line no-console
    console.log(`Apartments already present (${existing}) — skipping.`);
    return;
  }
  for (const apt of APARTMENTS) {
    await prisma.apartment.create({
      data: {
        title: apt.title,
        description: apt.description,
        city: apt.city,
        pricePerNight: apt.pricePerNight,
        bedrooms: apt.bedrooms,
        bathrooms: apt.bathrooms,
        maxGuests: apt.maxGuests,
        isPublished: apt.isPublished,
        images: {
          create: apt.imageSeeds.map((seed, i) => ({
            url: `https://picsum.photos/seed/${seed}/800/600`,
            alt: apt.title.en,
            isCover: i === 0,
            sortOrder: i,
          })),
        },
      },
    });
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${APARTMENTS.length} apartments.`);
}

/** A YYYY-MM-DD string `days` from today, as a UTC-midnight Date (@db.Date). */
function dateOnly(daysFromNow: number): Date {
  const now = new Date();
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(base + daysFromNow * 86_400_000);
}

function reference(): string {
  return `DK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

/** Give the sample guest a couple of bookings so /bookings has rows to show. */
async function seedBookings(): Promise<void> {
  const existing = await prisma.booking.count();
  if (existing > 0) {
    // eslint-disable-next-line no-console
    console.log(`Bookings already present (${existing}) — skipping.`);
    return;
  }

  const guest = await prisma.user.findUnique({
    where: { email: 'user@darelkhair.xyz' },
    select: { id: true },
  });
  const apartments = await prisma.apartment.findMany({
    where: { isPublished: true },
    select: { id: true, pricePerNight: true },
    take: 2,
  });
  if (!guest || apartments.length < 2) return;

  const seeds = [
    { apt: apartments[0], checkIn: 7, checkOut: 11, guests: 2, status: 'PENDING' as const },
    { apt: apartments[1], checkIn: 20, checkOut: 23, guests: 1, status: 'CONFIRMED' as const },
  ];

  for (const s of seeds) {
    const nights = s.checkOut - s.checkIn;
    await prisma.booking.create({
      data: {
        reference: reference(),
        userId: guest.id,
        apartmentId: s.apt.id,
        checkIn: dateOnly(s.checkIn),
        checkOut: dateOnly(s.checkOut),
        guests: s.guests,
        totalPrice: nights * Number(s.apt.pricePerNight),
        status: s.status,
        history: {
          create: { fromStatus: null, toStatus: s.status, changedBy: guest.id },
        },
      },
    });
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${seeds.length} bookings for user@darelkhair.xyz.`);
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

  await seedApartments();
  await seedBookings();

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
