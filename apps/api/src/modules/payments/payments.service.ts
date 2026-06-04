import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { AuditService } from '@/common/audit/audit.service';
import { AppConfigService } from '@/config/app.config';
import { StorageService } from '@/common/storage/storage.service';
import { formatDateOnly } from '@/common/utils/date';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { BookingsService } from '@/modules/bookings/bookings.service';
import {
  PaymentsRepository,
  type PaymentWithBooking,
} from './payments.repository';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import type {
  AdminPaymentDto,
  PaginatedPayments,
  PaymentDto,
  PaymentInstructions,
} from './types/payment.types';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly bookings: BookingsService,
    private readonly audit: AuditService,
    private readonly config: AppConfigService,
    private readonly storage: StorageService,
  ) {}

  // ── public ──

  /** Bank / mobile-money / WhatsApp details shown on the payment page. */
  instructions(): PaymentInstructions {
    const p = this.config.payments;
    return {
      bank: p.bank,
      mobileMoneyNumber: p.mobileMoneyNumber,
      whatsappNumber: p.whatsappNumber,
    };
  }

  // ── guest ──

  async getForBooking(
    userId: string,
    bookingId: string,
  ): Promise<PaymentDto | null> {
    const booking = await this.bookings.loadForPayment(bookingId);
    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }
    const payment = await this.repo.findByBookingId(bookingId);
    return payment ? this.toDto(payment) : null;
  }

  async submit(
    userId: string,
    bookingId: string,
    dto: SubmitPaymentDto,
    file: Express.Multer.File | undefined,
    ctx: RequestContext,
  ): Promise<PaymentDto> {
    const booking = await this.bookings.loadForPayment(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException('Not your booking');
    }
    if (booking.status !== BookingStatus.WAITING_PAYMENT) {
      throw new BadRequestException('This booking is not awaiting payment');
    }

    const isCash = dto.method === PaymentMethod.CASH;

    // Bank transfer / mobile money require an uploaded proof screenshot. Cash is
    // settled on arrival, so no proof — the admin confirms it later.
    let proofUrl: string | null = null;
    let proofKey: string | null = null;
    if (!isCash) {
      const uploaded = await this.uploadProof(bookingId, file);
      proofUrl = uploaded.url;
      proofKey = uploaded.key;
    }

    const previous = await this.repo.findByBookingId(bookingId);

    const payment = await this.repo.submit({
      bookingId,
      method: dto.method,
      amount: booking.totalPrice,
      reference: dto.reference,
      proofUrl,
      proofKey,
    });

    // Drop a superseded proof object from storage after the new one is saved.
    if (previous?.proofKey && previous.proofKey !== proofKey) {
      await this.storage.delete(previous.proofKey).catch(() => undefined);
    }

    // Proof uploaded → PROOF_SUBMITTED for review. Cash stays WAITING_PAYMENT
    // until the admin confirms the cash was received.
    if (!isCash) {
      await this.bookings.applyTransition(
        bookingId,
        BookingStatus.PROOF_SUBMITTED,
        userId,
        ctx,
        `Payment proof submitted (${dto.method})`,
      );
    }

    await this.audit.record({
      action: 'payment.submit',
      userId,
      entity: 'Payment',
      entityId: payment.id,
      metadata: { bookingId, method: dto.method, cash: isCash },
      ...ctx,
    });

    return this.toDto(payment);
  }

  // ── admin ──

  async adminList(query: PaymentQueryDto): Promise<PaginatedPayments> {
    const where: Prisma.PaymentWhereInput = {};
    if (query.status) where.status = query.status;

    const { items, total } = await this.repo.list({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return {
      items: items.map((p) => this.toAdminDto(p)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async adminGet(id: string): Promise<AdminPaymentDto> {
    const payment = await this.repo.findById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.toAdminDto(payment);
  }

  /** The payment for a booking (or null) — surfaced on the admin booking page. */
  async adminGetForBooking(bookingId: string): Promise<AdminPaymentDto | null> {
    const payment = await this.repo.findByBookingId(bookingId);
    return payment ? this.toAdminDto(payment) : null;
  }

  async verify(
    id: string,
    actorId: string,
    ctx: RequestContext,
  ): Promise<AdminPaymentDto> {
    const payment = await this.requireSubmitted(id);

    const updated = await this.repo.verify(id, actorId, new Date());
    // → CONFIRMED, whether from PROOF_SUBMITTED (proof approved) or directly from
    // WAITING_PAYMENT (cash received).
    await this.bookings.applyTransition(
      payment.bookingId,
      BookingStatus.CONFIRMED,
      actorId,
      ctx,
      payment.method === PaymentMethod.CASH
        ? 'Cash payment confirmed'
        : 'Payment verified',
    );

    await this.audit.record({
      action: 'payment.verify',
      userId: actorId,
      entity: 'Payment',
      entityId: id,
      metadata: { bookingId: payment.bookingId },
      ...ctx,
    });

    return this.toAdminDto(updated);
  }

  async reject(
    id: string,
    dto: RejectPaymentDto,
    actorId: string,
    ctx: RequestContext,
  ): Promise<AdminPaymentDto> {
    const payment = await this.requireSubmitted(id);
    const booking = await this.bookings.loadForPayment(payment.bookingId);

    const updated = await this.repo.reject(id);
    // Send a submitted-proof booking back to WAITING_PAYMENT so the guest can pay
    // again. A cash booking is already WAITING_PAYMENT, so just flag the payment.
    if (booking?.status === BookingStatus.PROOF_SUBMITTED) {
      await this.bookings.applyTransition(
        payment.bookingId,
        BookingStatus.WAITING_PAYMENT,
        actorId,
        ctx,
        dto.note ? `Payment rejected: ${dto.note}` : 'Payment rejected',
      );
    }

    await this.audit.record({
      action: 'payment.reject',
      userId: actorId,
      entity: 'Payment',
      entityId: id,
      metadata: { bookingId: payment.bookingId, note: dto.note },
      ...ctx,
    });

    return this.toAdminDto(updated);
  }

  // ── internals ──

  /** Validate + store an uploaded proof screenshot, returning its public URL/key. */
  private async uploadProof(
    bookingId: string,
    file: Express.Multer.File | undefined,
  ): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new BadRequestException('Proof of payment is required');
    }
    const extension = this.storage.extensionFor(file.mimetype);
    if (!extension) {
      throw new BadRequestException(
        `Unsupported file type. Allowed: ${this.storage.allowedMimeTypes.join(', ')}`,
      );
    }
    const maxBytes = this.config.storage.maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `File too large (max ${this.config.storage.maxSizeMb} MB)`,
      );
    }
    return this.storage.upload({
      buffer: file.buffer,
      contentType: file.mimetype,
      keyPrefix: `payments/${bookingId}`,
      extension,
    });
  }

  private async requireSubmitted(id: string): Promise<PaymentWithBooking> {
    const payment = await this.repo.findById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== PaymentStatus.SUBMITTED) {
      throw new BadRequestException(
        'Only a submitted payment can be verified or rejected',
      );
    }
    return payment;
  }

  private toDto(payment: PaymentWithBooking): PaymentDto {
    return {
      id: payment.id,
      bookingId: payment.bookingId,
      method: payment.method,
      status: payment.status,
      amount: Number(payment.amount),
      reference: payment.reference,
      proofUrl: payment.proofUrl,
      verifiedAt: payment.verifiedAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }

  private toAdminDto(payment: PaymentWithBooking): AdminPaymentDto {
    const u = payment.booking.user;
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return {
      ...this.toDto(payment),
      booking: {
        id: payment.booking.id,
        reference: payment.booking.reference,
        checkIn: formatDateOnly(payment.booking.checkIn),
        checkOut: formatDateOnly(payment.booking.checkOut),
        guestEmail: u.email,
        guestName: name || null,
      },
    };
  }
}
