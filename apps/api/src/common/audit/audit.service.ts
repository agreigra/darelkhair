import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

export interface AuditEntry {
  action: string;
  userId?: string | null;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/**
 * Cross-cutting audit log writer. Every feature records sensitive mutations
 * through this service (security rule). Failures are swallowed + logged so an
 * audit-write problem never breaks the user-facing operation.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          userId: entry.userId ?? null,
          entity: entry.entity,
          entityId: entry.entityId,
          metadata: (entry.metadata ?? undefined) as object | undefined,
          ip: entry.ip,
          userAgent: entry.userAgent,
        },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to write audit log for action "${entry.action}": ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
