import { mockDeep, type DeepMockProxy } from 'jest-mock-extended';
import type { PrismaService } from '@/prisma/prisma.service';
import type { AuditService } from '@/common/audit/audit.service';
import type { MailService } from '@/common/mail/mail.service';

/**
 * Shared test doubles for unit tests. Services are constructed via
 * `Test.createTestingModule` (or directly) with these mocks injected, so no
 * real database, mailer, or audit sink is touched.
 */

/** Deep-mocked Prisma — every model/method is an auto-stubbed jest.fn(). */
export function createPrismaMock(): DeepMockProxy<PrismaService> {
  return mockDeep<PrismaService>();
}

/** Audit writes are fire-and-forget; the mock just records calls. */
export function createAuditMock(): DeepMockProxy<AuditService> {
  return mockDeep<AuditService>();
}

/** Mail sends are fire-and-forget; the mock just records calls. */
export function createMailMock(): DeepMockProxy<MailService> {
  return mockDeep<MailService>();
}
