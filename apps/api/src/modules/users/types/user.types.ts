import type { UserRole } from '@prisma/client';

/** User shape returned to clients (admin views include `isActive`; never the hash). */
export interface UserDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface PaginatedUsers {
  items: UserDto[];
  total: number;
  page: number;
  pageSize: number;
}
