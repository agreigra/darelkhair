import { CalendarDays, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import type { BookingSummary } from './types';

/** Reusable booking summary tile (Feature 5: user bookings + admin lists). */
export function BookingCard({ booking }: { booking: BookingSummary }) {
  const { reference, apartmentTitle, checkIn, checkOut, guests, totalPrice, status } =
    booking;

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">{apartmentTitle}</CardTitle>
          <p className="text-xs text-muted-foreground">#{reference}</p>
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4" />
          {checkIn} → {checkOut}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="size-4" />
          {guests}
        </span>
      </CardContent>
      <CardFooter className="justify-end">
        <p className="text-sm font-semibold">{totalPrice}</p>
      </CardFooter>
    </Card>
  );
}
