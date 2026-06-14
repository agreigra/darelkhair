import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { AuditService } from '@/common/audit/audit.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import {
  formatDateOnly,
  nightsBetween,
  parseDateOnly,
  todayUtc,
} from '@/common/utils/date';
import type { LocalizedText } from '@/common/i18n/localized-text';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { AvailabilityService } from '@/modules/availability/availability.service';
import {
  BookingsRepository,
  type BookingWithRelations,
} from './bookings.repository';
import { canTransition, USER_CANCELLABLE } from './booking-status';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import type { BookingDto, PaginatedBookings } from './types/booking.types';

interface DtoOptions {
  history?: boolean;
  user?: boolean;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly repo: BookingsRepository,
    private readonly availability: AvailabilityService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ── guest (any authenticated user) ──

  async create(
    userId: string,
    dto: CreateBookingDto,
    ctx: RequestContext,
  ): Promise<BookingDto> {
    const apartment = await this.repo.apartmentForBooking(dto.apartmentId);
    if (!apartment || !apartment.isPublished) {
      throw new NotFoundException('Apartment not found');
    }

    const checkIn = parseDateOnly(dto.checkIn);
    const checkOut = parseDateOnly(dto.checkOut);
    if (checkOut.getTime() <= checkIn.getTime()) {
      throw new BadRequestException('checkOut must be after checkIn');
    }
    if (checkIn.getTime() < todayUtc().getTime()) {
      throw new BadRequestException('checkIn cannot be in the past');
    }
    if (dto.guests > apartment.maxGuests) {
      throw new BadRequestException(
        `This apartment allows at most ${apartment.maxGuests} guests`,
      );
    }

    // Reuse Feature 4's overlap logic (admin blocks + active bookings).
    const availability = await this.availability.check(dto.apartmentId, {
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
    });
    if (!availability.available) {
      throw new ConflictException('Selected dates are not available');
    }

    const nights = nightsBetween(checkIn, checkOut);
    const totalPrice = nights * Number(apartment.pricePerNight);

    const booking = await this.repo.create({
      userId,
      apartmentId: dto.apartmentId,
      checkIn,
      checkOut,
      guests: dto.guests,
      totalPrice,
      reference: this.newReference(),
    });

    await this.audit.record({
      action: 'booking.create',
      userId,
      entity: 'Booking',
      entityId: booking.id,
      metadata: {
        apartmentId: dto.apartmentId,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        guests: dto.guests,
        totalPrice,
      },
      ...ctx,
    });

    // Confirmation notification to the guest (booking received → awaiting payment).
    await this.notifications.notifyBookingCreated(userId, {
      bookingId: booking.id,
      reference: booking.reference,
      status: booking.status,
    });

    return this.toDto(booking, { history: true });
  }

  async listMine(
    userId: string,
    query: BookingQueryDto,
  ): Promise<PaginatedBookings> {
    const where: Prisma.BookingWhereInput = { userId };
    if (query.status) where.status = query.status;
    return this.runList(where, query);
  }

  async getMine(userId: string, id: string): Promise<BookingDto> {
    const booking = await this.repo.findById(id);
    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }
    return this.toDto(booking, { history: true });
  }

  async cancelMine(
    userId: string,
    id: string,
    ctx: RequestContext,
  ): Promise<BookingDto> {
    const booking = await this.repo.findById(id);
    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }
    if (!USER_CANCELLABLE.includes(booking.status)) {
      throw new BadRequestException('This booking can no longer be cancelled');
    }
    return this.transition(
      booking,
      BookingStatus.CANCELLED,
      userId,
      ctx,
      'Cancelled by guest',
    );
  }

  // ── admin ──

  async adminList(query: BookingQueryDto): Promise<PaginatedBookings> {
    const where: Prisma.BookingWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { reference: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    return this.runList(where, query, { user: true });
  }

  async adminGet(id: string): Promise<BookingDto> {
    const booking = await this.repo.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return this.toDto(booking, { history: true, user: true });
  }

  async adminUpdateStatus(
    id: string,
    dto: UpdateBookingStatusDto,
    actorId: string,
    ctx: RequestContext,
  ): Promise<BookingDto> {
    const booking = await this.repo.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return this.transition(booking, dto.status, actorId, ctx, dto.note, true);
  }

  // ── cross-module (reviews, Feature 13) ──

  /** True if the user has at least one CONFIRMED booking for the apartment. */
  async hasConfirmedStay(userId: string, apartmentId: string): Promise<boolean> {
    return this.repo.existsConfirmedForApartment(userId, apartmentId);
  }

  // ── cross-module (payments, Feature 6) ──

  /** Minimal booking info the payment flow needs (ownership, gate, amount). */
  async loadForPayment(bookingId: string): Promise<{
    id: string;
    userId: string;
    status: BookingStatus;
    totalPrice: number;
  } | null> {
    const booking = await this.repo.findById(bookingId);
    if (!booking) return null;
    return {
      id: booking.id,
      userId: booking.userId,
      status: booking.status,
      totalPrice: Number(booking.totalPrice),
    };
  }

  /** Run a validated status transition initiated by another module (payments). */
  async applyTransition(
    bookingId: string,
    to: BookingStatus,
    actorId: string,
    ctx: RequestContext,
    note?: string,
  ): Promise<void> {
    const booking = await this.repo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    await this.transition(booking, to, actorId, ctx, note);
  }

  // ── internals ──

  private async transition(
    booking: BookingWithRelations,
    to: BookingStatus,
    actorId: string,
    ctx: RequestContext,
    note?: string,
    includeUser = false,
  ): Promise<BookingDto> {
    if (booking.status === to) {
      throw new BadRequestException('Booking is already in that status');
    }
    if (!canTransition(booking.status, to)) {
      throw new BadRequestException(
        `Cannot move a ${booking.status} booking to ${to}`,
      );
    }

    const updated = await this.repo.updateStatus(
      booking.id,
      booking.status,
      to,
      actorId,
      note,
    );

    await this.audit.record({
      action: 'booking.status_change',
      userId: actorId,
      entity: 'Booking',
      entityId: booking.id,
      metadata: { from: booking.status, to, note },
      ...ctx,
    });

    // Notify the booking owner of the new status — but not when they triggered it
    // themselves (e.g. self-cancel, submitting payment proof), to avoid noise.
    if (actorId !== booking.userId) {
      await this.notifications.notifyBookingStatusChanged(booking.userId, {
        bookingId: booking.id,
        reference: booking.reference,
        status: to,
        note,
      });
    }

    return this.toDto(updated, { history: true, user: includeUser });
  }

  private async runList(
    where: Prisma.BookingWhereInput,
    query: BookingQueryDto,
    options: DtoOptions = {},
  ): Promise<PaginatedBookings> {
    const { items, total } = await this.repo.list({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return {
      items: items.map((b) => this.toDto(b, options)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  /** Short human-friendly, collision-resistant reference (unique-constrained). */
  private newReference(): string {
    return `DK-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  }

  private toDto(
    booking: BookingWithRelations,
    options: DtoOptions = {},
  ): BookingDto {
    const dto: BookingDto = {
      id: booking.id,
      reference: booking.reference,
      apartmentId: booking.apartmentId,
      apartment: {
        id: booking.apartment.id,
        title: (booking.apartment.title ?? {}) as LocalizedText,
        city: (booking.apartment.city as LocalizedText | null) ?? null,
        coverImageUrl: booking.apartment.images[0]?.url ?? null,
      },
      checkIn: formatDateOnly(booking.checkIn),
      checkOut: formatDateOnly(booking.checkOut),
      nights: nightsBetween(booking.checkIn, booking.checkOut),
      guests: booking.guests,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    };

    if (options.history) {
      dto.history = booking.history.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        note: h.note,
        createdAt: h.createdAt.toISOString(),
      }));
    }

    if (options.user) {
      dto.user = {
        id: booking.user.id,
        email: booking.user.email,
        firstName: booking.user.firstName,
        lastName: booking.user.lastName,
        phone: booking.user.phone,
      };
    }

    return dto;
  }
}
