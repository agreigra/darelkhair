import { Injectable } from '@nestjs/common';
import type {
  EmailVerificationToken,
  PasswordResetToken,
  Prisma,
  RefreshToken,
  User,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Data access for the auth feature. Wraps PrismaService so the service layer
 * never touches the ORM directly — keeps the feature's persistence isolated.
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<(RefreshToken & { user: User }) | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  revokeRefreshToken(id: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  /** Revoke every active refresh token for a user (e.g. global logout). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ── Password reset ──

  /** Invalidate any outstanding (unused) reset tokens before issuing a new one. */
  async deletePasswordResetTokensForUser(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({ where: { userId } });
  }

  createPasswordResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.create({ data });
  }

  findPasswordResetTokenByHash(
    tokenHash: string,
  ): Promise<(PasswordResetToken & { user: User }) | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  markPasswordResetTokenUsed(id: string): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  /** Update a user's password hash (used by the reset flow). */
  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  // ── Email verification ──

  /** Invalidate any outstanding verification tokens before issuing a new one. */
  async deleteEmailVerificationTokensForUser(userId: string): Promise<void> {
    await this.prisma.emailVerificationToken.deleteMany({ where: { userId } });
  }

  createEmailVerificationToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<EmailVerificationToken> {
    return this.prisma.emailVerificationToken.create({ data });
  }

  findEmailVerificationTokenByHash(
    tokenHash: string,
  ): Promise<(EmailVerificationToken & { user: User }) | null> {
    return this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  markEmailVerificationTokenUsed(id: string): Promise<EmailVerificationToken> {
    return this.prisma.emailVerificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  /** Mark a user's email as verified (used by the verify flow). */
  async setEmailVerified(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }
}
