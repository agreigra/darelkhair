import { createHash, randomBytes } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import { AppConfigService } from '@/config/app.config';
import { AuditService } from '@/common/audit/audit.service';
import { parseDurationToMs } from '@/common/utils/duration';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type {
  JwtPayload,
  PublicUser,
  RequestContext,
} from './types/auth.types';

const BCRYPT_ROUNDS = 12;

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
  ) {}

  async register(dto: RegisterDto, ctx: RequestContext): Promise<AuthResult> {
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

    return this.buildAuthResult(user);
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
