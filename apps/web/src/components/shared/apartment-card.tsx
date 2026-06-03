import Image from 'next/image';
import { BedDouble, Bath, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import type { ApartmentSummary } from './types';

/** Reusable apartment tile for the browse grid (Feature 3). */
export function ApartmentCard({ apartment }: { apartment: ApartmentSummary }) {
  const { id, title, city, pricePerNight, bedrooms, bathrooms, maxGuests } =
    apartment;

  return (
    <Link href={`/apartments/${id}`} className="group block">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[4/3] bg-muted">
          {apartment.coverImageUrl ? (
            <Image
              src={apartment.coverImageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <CardContent className="space-y-1 pt-4">
          <h3 className="font-medium leading-tight">{title}</h3>
          {city ? (
            <p className="text-sm text-muted-foreground">{city}</p>
          ) : null}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="size-3.5" /> {bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="size-3.5" /> {bathrooms}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {maxGuests}
            </span>
          </div>
          <p className="text-sm font-semibold">
            {pricePerNight}
            <span className="text-xs font-normal text-muted-foreground">
              {' '}
              / night
            </span>
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
