import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

/** Cover image (or first) + the bits the booking DTO needs from an apartment. */
const apartmentSelect = {
  id: true,
  title: true,
  city: true,
  images: {
    orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.ApartmentSelect;

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
} satisfies Prisma.UserSelect;

const bookingInclude = {
  apartment: { select: apartmentSelect },
  user: { select: userSelect },
  history: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.BookingInclude;

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: typeof bookingInclude;
}>;

interface CreateBookingData {
  userId: string;
  apartmentId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  reference: string;
}

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Minimal apartment fields needed to validate + price a new booking. */
  apartmentForBooking(id: string) {
    return this.prisma.apartment.findUnique({
      where: { id },
      select: { id: true, isPublished: true, pricePerNight: true, maxGuests: true },
    });
  }

  /** Create the booking and its opening history row atomically (nested write). */
  create(data: CreateBookingData): Promise<BookingWithRelations> {
    return this.prisma.booking.create({
      data: {
        reference: data.reference,
        userId: data.userId,
        apartmentId: data.apartmentId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests,
        totalPrice: data.totalPrice,
        // Bookings enter the payment arc immediately — the guest pays right after
        // booking (offline), so there is no separate admin-approval (PENDING) step.
        status: BookingStatus.WAITING_PAYMENT,
        history: {
          create: {
            fromStatus: null,
            toStatus: BookingStatus.WAITING_PAYMENT,
            changedBy: data.userId,
          },
        },
      },
      include: bookingInclude,
    });
  }

  /** Has this user ever had a CONFIRMED booking for this apartment? (review gate) */
  async existsConfirmedForApartment(
    userId: string,
    apartmentId: string,
  ): Promise<boolean> {
    const count = await this.prisma.booking.count({
      where: { userId, apartmentId, status: BookingStatus.CONFIRMED },
    });
    return count > 0;
  }

  findById(id: string): Promise<BookingWithRelations | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });
  }

  /** Apply a status change and append the matching history row atomically. */
  updateStatus(
    id: string,
    from: BookingStatus,
    to: BookingStatus,
    changedBy: string,
    note?: string,
  ): Promise<BookingWithRelations> {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: to,
        history: { create: { fromStatus: from, toStatus: to, changedBy, note } },
      },
      include: bookingInclude,
    });
  }

  async list(params: {
    where: Prisma.BookingWhereInput;
    skip: number;
    take: number;
  }): Promise<{ items: BookingWithRelations[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: bookingInclude,
      }),
      this.prisma.booking.count({ where: params.where }),
    ]);
    return { items, total };
  }
}
