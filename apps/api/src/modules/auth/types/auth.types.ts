import type { UserRole } from '@prisma/client';

/** Claims embedded in the signed access token. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/** Shape attached to `request.user` after JwtAuthGuard validates a request. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

/** User fields safe to return to clients (never the password hash). */
export interface PublicUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
}

/** Request metadata captured for auditing auth events. */
export interface RequestContext {
  ip?: string;
  userAgent?: string;
}
