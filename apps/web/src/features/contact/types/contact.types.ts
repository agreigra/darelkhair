export type ContactStatus = 'NEW' | 'HANDLED';

/** Public contact details rendered on the Contact page. */
export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  handledAt: string | null;
}

export interface PaginatedContactMessages {
  items: ContactMessage[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: ContactStatus;
}
