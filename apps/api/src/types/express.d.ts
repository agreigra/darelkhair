import type { AuthenticatedUser } from '@/modules/auth/types/auth.types';

// Augment Express's Request so `request.user` is typed after JwtAuthGuard runs.
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
