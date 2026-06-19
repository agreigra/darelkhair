import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { PasswordResetToken, RefreshToken, User } from '@prisma/client';
import type { AppConfigService } from '@/config/app.config';
import type { AuditService } from '@/common/audit/audit.service';
import type { MailService } from '@/common/mail/mail.service';
import { AuthService } from './auth.service';
import type { AuthRepository } from './auth.repository';
import { createPrismaMock, createAuditMock, createMailMock } from '@/test/mocks';
import { mockDeep, type DeepMockProxy } from 'jest-mock-extended';

const PASSWORD = 'correct horse battery';
const CTX = { ip: '127.0.0.1', userAgent: 'jest' };

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    passwordHash: 'set-in-beforeAll',
    firstName: 'Ada',
    lastName: 'Lovelace',
    phone: null,
    role: 'USER',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  } as User;
}

describe('AuthService', () => {
  let service: AuthService;
  let repo: DeepMockProxy<AuthRepository>;
  let jwt: { signAsync: jest.Mock };
  let audit: ReturnType<typeof createAuditMock>;
  let mail: ReturnType<typeof createMailMock>;
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(PASSWORD, 4);
  });

  beforeEach(() => {
    repo = mockDeep<AuthRepository>();
    jwt = { signAsync: jest.fn().mockResolvedValue('signed-access-token') };
    audit = createAuditMock();
    mail = createMailMock();
    const config = {
      jwt: {
        accessSecret: 'access-secret',
        accessExpiresIn: '15m',
        refreshSecret: 'refresh-secret',
        refreshExpiresIn: '7d',
      },
      webAppUrl: 'https://app.darelkhair.test',
    } as unknown as AppConfigService;

    // createPrismaMock isn't needed here (repo is mocked directly) but keep the
    // import exercised so the shared helper stays covered.
    void createPrismaMock;

    service = new AuthService(
      repo as unknown as AuthRepository,
      jwt as unknown as JwtService,
      config,
      audit as unknown as AuditService,
      mail as unknown as MailService,
    );
  });

  describe('register', () => {
    it('rejects an already-registered email', async () => {
      repo.findUserByEmail.mockResolvedValue(makeUser());
      await expect(service.register({ email: 'user@example.com', password: PASSWORD } as never, CTX)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repo.createUser).not.toHaveBeenCalled();
    });

    it('hashes the password and returns a session', async () => {
      repo.findUserByEmail.mockResolvedValue(null);
      repo.createUser.mockResolvedValue(makeUser({ passwordHash }));

      const result = await service.register(
        { email: 'user@example.com', password: PASSWORD } as never,
        CTX,
      );

      const created = repo.createUser.mock.calls[0][0] as { passwordHash: string };
      expect(created.passwordHash).not.toBe(PASSWORD); // stored as a hash
      expect(result.accessToken).toBe('signed-access-token');
      expect(result.user.email).toBe('user@example.com');
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'auth.register' }),
      );
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      repo.findUserByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@example.com', password: PASSWORD } as never, CTX),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password', async () => {
      repo.findUserByEmail.mockResolvedValue(makeUser({ passwordHash }));
      await expect(
        service.login({ email: 'user@example.com', password: 'wrong' } as never, CTX),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a disabled account even with the right password', async () => {
      repo.findUserByEmail.mockResolvedValue(makeUser({ passwordHash, isActive: false }));
      await expect(
        service.login({ email: 'user@example.com', password: PASSWORD } as never, CTX),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns a session for valid credentials', async () => {
      repo.findUserByEmail.mockResolvedValue(makeUser({ passwordHash }));
      const result = await service.login(
        { email: 'user@example.com', password: PASSWORD } as never,
        CTX,
      );
      expect(result.accessToken).toBe('signed-access-token');
      expect(repo.createRefreshToken).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const future = new Date(Date.now() + 60_000);

    it('rejects a missing token', async () => {
      await expect(service.refresh(undefined, CTX)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects an unknown token', async () => {
      repo.findRefreshTokenByHash.mockResolvedValue(null);
      await expect(service.refresh('raw', CTX)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('revokes the whole family when a revoked token is reused', async () => {
      repo.findRefreshTokenByHash.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        revokedAt: new Date(),
        expiresAt: future,
        user: makeUser(),
      } as RefreshToken & { user: User });

      await expect(service.refresh('raw', CTX)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(repo.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });

    it('rejects an expired token', async () => {
      repo.findRefreshTokenByHash.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1),
        user: makeUser(),
      } as RefreshToken & { user: User });
      await expect(service.refresh('raw', CTX)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rotates a valid token and issues a new pair', async () => {
      repo.findRefreshTokenByHash.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: future,
        user: makeUser(),
      } as RefreshToken & { user: User });

      const result = await service.refresh('raw', CTX);
      expect(repo.revokeRefreshToken).toHaveBeenCalledWith('rt-1');
      expect(repo.createRefreshToken).toHaveBeenCalled();
      expect(result.accessToken).toBe('signed-access-token');
    });
  });

  describe('logout', () => {
    it('is a no-op without a token', async () => {
      await service.logout(undefined, CTX);
      expect(repo.findRefreshTokenByHash).not.toHaveBeenCalled();
    });

    it('revokes an active token', async () => {
      repo.findRefreshTokenByHash.mockResolvedValue({
        id: 'rt-1',
        userId: 'user-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: makeUser(),
      } as RefreshToken & { user: User });
      await service.logout('raw', CTX);
      expect(repo.revokeRefreshToken).toHaveBeenCalledWith('rt-1');
    });
  });

  describe('forgotPassword', () => {
    it('is a silent no-op for an unknown email (no enumeration)', async () => {
      repo.findUserByEmail.mockResolvedValue(null);
      await service.forgotPassword({ email: 'nobody@example.com' }, CTX);
      expect(repo.createPasswordResetToken).not.toHaveBeenCalled();
      expect(mail.send).not.toHaveBeenCalled();
    });

    it('is a silent no-op for an inactive user', async () => {
      repo.findUserByEmail.mockResolvedValue(makeUser({ isActive: false }));
      await service.forgotPassword({ email: 'user@example.com' }, CTX);
      expect(repo.createPasswordResetToken).not.toHaveBeenCalled();
      expect(mail.send).not.toHaveBeenCalled();
    });

    it('issues a single-use token and emails a link for an active user', async () => {
      repo.findUserByEmail.mockResolvedValue(makeUser());
      await service.forgotPassword({ email: 'user@example.com' }, CTX);

      expect(repo.deletePasswordResetTokensForUser).toHaveBeenCalledWith('user-1');
      expect(repo.createPasswordResetToken).toHaveBeenCalledTimes(1);
      // The raw token is emailed; only its hash is stored.
      const stored = repo.createPasswordResetToken.mock.calls[0][0];
      const sent = mail.send.mock.calls[0][0];
      expect(sent.to).toBe('user@example.com');
      expect(sent.text).toContain('https://app.darelkhair.test/reset-password?token=');
      const rawToken = sent.text.match(/token=([a-f0-9]+)/)?.[1];
      expect(rawToken).toBeTruthy();
      expect(stored.tokenHash).not.toBe(rawToken); // stored hashed, not raw
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'auth.password_reset_requested' }),
      );
    });
  });

  describe('resetPassword', () => {
    const validRow = (overrides: Partial<PasswordResetToken> = {}) =>
      ({
        id: 'prt-1',
        userId: 'user-1',
        tokenHash: 'hash',
        usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        user: makeUser(),
        ...overrides,
      }) as PasswordResetToken & { user: User };

    it('rejects an unknown token', async () => {
      repo.findPasswordResetTokenByHash.mockResolvedValue(null);
      await expect(
        service.resetPassword({ token: 'x', password: 'newpassword' }, CTX),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an already-used token', async () => {
      repo.findPasswordResetTokenByHash.mockResolvedValue(validRow({ usedAt: new Date() }));
      await expect(
        service.resetPassword({ token: 'x', password: 'newpassword' }, CTX),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an expired token', async () => {
      repo.findPasswordResetTokenByHash.mockResolvedValue(
        validRow({ expiresAt: new Date(Date.now() - 1) }),
      );
      await expect(
        service.resetPassword({ token: 'x', password: 'newpassword' }, CTX),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when the user is inactive', async () => {
      repo.findPasswordResetTokenByHash.mockResolvedValue(
        validRow({ user: makeUser({ isActive: false }) } as never),
      );
      await expect(
        service.resetPassword({ token: 'x', password: 'newpassword' }, CTX),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('sets the new password, consumes the token, and revokes sessions', async () => {
      repo.findPasswordResetTokenByHash.mockResolvedValue(validRow());

      await service.resetPassword({ token: 'x', password: 'newpassword' }, CTX);

      const [userId, newHash] = repo.updateUserPassword.mock.calls[0];
      expect(userId).toBe('user-1');
      expect(await bcrypt.compare('newpassword', newHash)).toBe(true);
      expect(repo.markPasswordResetTokenUsed).toHaveBeenCalledWith('prt-1');
      expect(repo.revokeAllForUser).toHaveBeenCalledWith('user-1');
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'auth.password_reset_completed' }),
      );
    });
  });
});
