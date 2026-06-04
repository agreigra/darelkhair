import { Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

const bookingInclude = {
  booking: {
    select: {
      id: true,
      reference: true,
      checkIn: true,
      checkOut: true,
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  },
} satisfies Prisma.PaymentInclude;

export type PaymentWithBooking = Prisma.PaymentGetPayload<{
  include: typeof bookingInclude;
}>;

interface UpsertPaymentData {
  bookingId: string;
  method: Prisma.PaymentCreateInput['method'];
  amount: number;
  reference?: string;
}

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByBookingId(bookingId: string): Promise<PaymentWithBooking | null> {
    return this.prisma.payment.findUnique({
      where: { bookingId },
      include: bookingInclude,
    });
  }

  findById(id: string): Promise<PaymentWithBooking | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: bookingInclude,
    });
  }

  /** Create the payment, or re-arm a previously rejected one (status → SUBMITTED). */
  submit(data: UpsertPaymentData): Promise<PaymentWithBooking> {
    return this.prisma.payment.upsert({
      where: { bookingId: data.bookingId },
      create: {
        bookingId: data.bookingId,
        method: data.method,
        amount: data.amount,
        reference: data.reference,
        status: PaymentStatus.SUBMITTED,
      },
      update: {
        method: data.method,
        reference: data.reference,
        status: PaymentStatus.SUBMITTED,
        verifiedById: null,
        verifiedAt: null,
      },
      include: bookingInclude,
    });
  }

  verify(id: string, verifiedById: string, verifiedAt: Date): Promise<PaymentWithBooking> {
    return this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.VERIFIED, verifiedById, verifiedAt },
      include: bookingInclude,
    });
  }

  reject(id: string): Promise<PaymentWithBooking> {
    return this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.REJECTED, verifiedById: null, verifiedAt: null },
      include: bookingInclude,
    });
  }

  async list(params: {
    where: Prisma.PaymentWhereInput;
    skip: number;
    take: number;
  }): Promise<{ items: PaymentWithBooking[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: bookingInclude,
      }),
      this.prisma.payment.count({ where: params.where }),
    ]);
    return { items, total };
  }
}
