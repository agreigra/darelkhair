import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import { AppConfigService } from '@/config/app.config';
import { AuditService } from '@/common/audit/audit.service';
import { MailService } from '@/common/mail/mail.service';
import { parseDurationToMs } from '@/common/utils/duration';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import {
  normalizeLocale,
  verificationEmail,
  passwordResetEmail,
} from './auth.emails';
import type {
  JwtPayload,
  PublicUser,
  RequestContext,
} from './types/auth.types';

const BCRYPT_ROUNDS = 12;
/** How long a password-reset token stays valid. */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
/** How long an email-verification token stays valid. */
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Returned by register — no session is issued until the email is verified. */
export interface RegisterResult {
  email: string;
}

/** Result returned to the controller, which turns the refresh token into a cookie. */
export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
    private readonly audit: AuditService,
    private readonly mail: MailService,
  ) {}

  /**
   * Create an account. The user starts unverified and is NOT logged in — a
   * verification link is emailed, and login is blocked until they confirm it
   * (see `login`). This is why register returns only the email, not a session.
   */
  async register(
    dto: RegisterDto,
    ctx: RequestContext,
  ): Promise<RegisterResult> {
    const existing = await this.repo.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.repo.createUser({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      phone: dto.phone ?? null,
    });

    await this.audit.record({
      action: 'auth.register',
      userId: user.id,
      entity: 'User',
      entityId: user.id,
      ...ctx,
    });

    await this.issueVerificationEmail(user, ctx.locale);

    return { email: user.email };
  }

  async login(dto: LoginDto, ctx: RequestContext): Promise<AuthResult> {
    const user = await this.repo.findUserByEmail(dto.email);
    // Always run a comparison-shaped check to avoid leaking which emails exist.
    const ok = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;
    if (!user || !ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }
    if (!user.emailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    await this.audit.record({
      action: 'auth.login',
      userId: user.id,
      entity: 'User',
      entityId: user.id,
      ...ctx,
    });

    return this.buildAuthResult(user);
  }

  async refresh(
    rawToken: string | undefined,
    ctx: RequestContext,
  ): Promise<AuthResult> {
    if (!rawToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const tokenHash = this.hashToken(rawToken);
    const stored = await this.repo.findRefreshTokenByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // Reuse of an already-revoked token signals theft — revoke the whole family.
    if (stored.revokedAt) {
      await this.repo.revokeAllForUser(stored.userId);
      await this.audit.record({
        action: 'auth.refresh_reuse_detected',
        userId: stored.userId,
        entity: 'RefreshToken',
        entityId: stored.id,
        ...ctx,
      });
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Rotate: revoke the presented token and issue a fresh pair.
    await this.repo.revokeRefreshToken(stored.id);

    await this.audit.record({
      action: 'auth.refresh',
      userId: stored.userId,
      entity: 'User',
      entityId: stored.userId,
      ...ctx,
    });

    return this.buildAuthResult(stored.user);
  }

  async logout(
    rawToken: string | undefined,
    ctx: RequestContext,
  ): Promise<void> {
    if (!rawToken) return;
    const stored = await this.repo.findRefreshTokenByHash(
      this.hashToken(rawToken),
    );
    if (stored && !stored.revokedAt) {
      await this.repo.revokeRefreshToken(stored.id);
      await this.audit.record({
        action: 'auth.logout',
        userId: stored.userId,
        entity: 'User',
        entityId: stored.userId,
        ...ctx,
      });
    }
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return this.toPublicUser(user);
  }

  /**
   * Start the forgot-password flow. Always resolves the same way regardless of
   * whether the email exists, so the endpoint can't be used to enumerate
   * accounts. When the email maps to an active user we issue a single-use,
   * short-lived token and email a reset link.
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
    ctx: RequestContext,
  ): Promise<void> {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user || !user.isActive) {
      return; // silently no-op — don't reveal whether the account exists
    }

    // Only one outstanding token per user — drop any previous ones.
    await this.repo.deletePasswordResetTokensForUser(user.id);

    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.repo.createPasswordResetToken({
      userId: user.id,
      tokenHash: this.hashToken(rawToken),
      expiresAt,
    });

    const resetUrl = `${this.config.webAppUrl}/reset-password?token=${rawToken}`;
    await this.mail.send({
      to: user.email,
      ...passwordResetEmail(normalizeLocale(ctx.locale), resetUrl),
    });

    await this.audit.record({
      action: 'auth.password_reset_requested',
      userId: user.id,
      entity: 'User',
      entityId: user.id,
      ...ctx,
    });
  }

  /**
   * Complete the forgot-password flow: validate the token, set the new password,
   * mark the token used, and revoke every refresh token so existing sessions are
   * logged out (a reset implies the old credentials may be compromised).
   */
  async resetPassword(
    dto: ResetPasswordDto,
    ctx: RequestContext,
  ): Promise<void> {
    const stored = await this.repo.findPasswordResetTokenByHash(
      this.hashToken(dto.token),
    );

    if (
      !stored ||
      stored.usedAt ||
      stored.expiresAt.getTime() < Date.now() ||
      !stored.user.isActive
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.repo.updateUserPassword(stored.userId, passwordHash);
    await this.repo.markPasswordResetTokenUsed(stored.id);
    await this.repo.revokeAllForUser(stored.userId);

    await this.audit.record({
      action: 'auth.password_reset_completed',
      userId: stored.userId,
      entity: 'User',
      entityId: stored.userId,
      ...ctx,
    });
  }

  /**
   * Confirm a sign-up email. Validates the token, flags the account verified,
   * and consumes the token. After this the user can log in.
   */
  async verifyEmail(dto: VerifyEmailDto, ctx: RequestContext): Promise<void> {
    const stored = await this.repo.findEmailVerificationTokenByHash(
      this.hashToken(dto.token),
    );

    if (
      !stored ||
      stored.usedAt ||
      stored.expiresAt.getTime() < Date.now() ||
      !stored.user.isActive
    ) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.repo.setEmailVerified(stored.userId);
    await this.repo.markEmailVerificationTokenUsed(stored.id);

    await this.audit.record({
      action: 'auth.email_verified',
      userId: stored.userId,
      entity: 'User',
      entityId: stored.userId,
      ...ctx,
    });
  }

  /**
   * Re-send the verification email. Resolves the same way regardless of whether
   * the email exists or is already verified, so it can't be used to enumerate
   * accounts.
   */
  async resendVerification(
    dto: ResendVerificationDto,
    ctx: RequestContext,
  ): Promise<void> {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user || !user.isActive || user.emailVerified) {
      return; // silently no-op
    }
    await this.issueVerificationEmail(user, ctx.locale);
    await this.audit.record({
      action: 'auth.verification_resent',
      userId: user.id,
      entity: 'User',
      entityId: user.id,
      ...ctx,
    });
  }

  // ── internals ──

  private async buildAuthResult(user: User): Promise<AuthResult> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.jwt.accessSecret,
      expiresIn: this.config.jwt.accessExpiresIn,
    });

    const rawRefresh = randomBytes(48).toString('hex');
    const expiresAt = new Date(
      Date.now() + parseDurationToMs(this.config.jwt.refreshExpiresIn),
    );
    await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(rawRefresh),
      expiresAt,
    });

    return {
      user: this.toPublicUser(user),
      accessToken,
      refreshToken: rawRefresh,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  /**
   * Issue a fresh single-use verification token and email the confirmation
   * link. Shared by register and resendVerification. Like the reset email, the
   * send is best-effort — `MailService.send` swallows its own errors.
   */
  private async issueVerificationEmail(
    user: User,
    locale: string | undefined,
  ): Promise<void> {
    await this.repo.deleteEmailVerificationTokensForUser(user.id);

    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
    await this.repo.createEmailVerificationToken({
      userId: user.id,
      tokenHash: this.hashToken(rawToken),
      expiresAt,
    });

    const verifyUrl = `${this.config.webAppUrl}/verify-email?token=${rawToken}`;
    await this.mail.send({
      to: user.email,
      ...verificationEmail(normalizeLocale(locale), verifyUrl),
    });
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
