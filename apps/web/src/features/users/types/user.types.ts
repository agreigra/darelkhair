export type UserRole = 'USER' | 'ADMIN';

/** Full user as managed by this feature (profile + admin views). */
export interface ManagedUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedUsers {
  items: ManagedUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AdminUpdateInput {
  role?: UserRole;
  isActive?: boolean;
}

export interface UsersQuery {
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole;
}
