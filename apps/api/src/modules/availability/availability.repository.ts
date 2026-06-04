import { Injectable } from '@nestjs/common';
import { BookingStatus, type AvailabilitySlot } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

interface DateRange {
  start: Date;
  end: Date;
}

@Injectable()
export class AvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  apartmentExists(id: string): Promise<{ id: string } | null> {
    return this.prisma.apartment.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  listBlocks(apartmentId: string): Promise<AvailabilitySlot[]> {
    return this.prisma.availabilitySlot.findMany({
      where: { apartmentId, isAvailable: false },
      orderBy: { startDate: 'asc' },
    });
  }

  /** Admin blocks overlapping a [from, to] window (inclusive). */
  blocksInWindow(
    apartmentId: string,
    window: DateRange,
  ): Promise<AvailabilitySlot[]> {
    return this.prisma.availabilitySlot.findMany({
      where: {
        apartmentId,
        isAvailable: false,
        startDate: { lte: window.end },
        endDate: { gte: window.start },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  /** Active (non-cancelled) bookings overlapping a [from, to] window. */
  bookingsInWindow(apartmentId: string, window: DateRange) {
    return this.prisma.booking.findMany({
      where: {
        apartmentId,
        status: { not: BookingStatus.CANCELLED },
        checkIn: { lte: window.end },
        checkOut: { gte: window.start },
      },
      select: { checkIn: true, checkOut: true },
      orderBy: { checkIn: 'asc' },
    });
  }

  /** A block overlapping the half-open stay [checkIn, checkOut). */
  blockOverlapping(
    apartmentId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<AvailabilitySlot | null> {
    return this.prisma.availabilitySlot.findFirst({
      where: {
        apartmentId,
        isAvailable: false,
        startDate: { lt: checkOut },
        endDate: { gte: checkIn },
      },
    });
  }

  /** An active booking overlapping the half-open stay [checkIn, checkOut). */
  bookingOverlapping(apartmentId: string, checkIn: Date, checkOut: Date) {
    return this.prisma.booking.findFirst({
      where: {
        apartmentId,
        status: { not: BookingStatus.CANCELLED },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { id: true },
    });
  }

  createBlock(
    apartmentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailabilitySlot> {
    return this.prisma.availabilitySlot.create({
      data: { apartmentId, startDate, endDate, isAvailable: false },
    });
  }

  findSlot(slotId: string): Promise<AvailabilitySlot | null> {
    return this.prisma.availabilitySlot.findUnique({ where: { id: slotId } });
  }

  deleteSlot(slotId: string): Promise<{ id: string }> {
    return this.prisma.availabilitySlot.delete({
      where: { id: slotId },
      select: { id: true },
    });
  }
}
