import type { ContactStatus } from '@prisma/client';

/** Public contact details shown on the Contact page (sourced from config). */
export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string;
}

/** A contact submission as returned to admins. */
export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  handledAt: Date | null;
}

export interface PaginatedContactMessages {
  items: ContactMessageDto[];
  total: number;
  page: number;
  pageSize: number;
}
