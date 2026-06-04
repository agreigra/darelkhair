import type { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface PaymentDto {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  reference: string | null;
  proofUrl: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Admin list row — payment plus enough booking/guest context to triage. */
export interface AdminPaymentDto extends PaymentDto {
  booking: {
    id: string;
    reference: string;
    checkIn: string;
    checkOut: string;
    guestEmail: string;
    guestName: string | null;
  };
}

export interface PaginatedPayments {
  items: AdminPaymentDto[];
  total: number;
  page: number;
  pageSize: number;
}

/** Public offline-payment instructions shown to the guest. */
export interface PaymentInstructions {
  bank: {
    name: string;
    accountName: string;
    accountNumber: string;
    iban: string | null;
  };
  mobileMoneyNumber: string;
  whatsappNumber: string;
}
