export type PaymentMethod = 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CASH';
export type PaymentStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'BANK_TRANSFER',
  'MOBILE_MONEY',
  'CASH',
];

export interface Payment {
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

export interface AdminPayment extends Payment {
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
  items: AdminPayment[];
  total: number;
  page: number;
  pageSize: number;
}

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

export interface PaymentFilters {
  page: number;
  pageSize: number;
  status?: PaymentStatus;
}

export interface SubmitPaymentInput {
  method: PaymentMethod;
  reference?: string;
  /** Required for bank transfer / mobile money; omitted for cash. */
  proof?: File;
}
