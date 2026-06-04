import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Public } from '@/modules/auth/decorators/public.decorator';

/**
 * Liveness/readiness probe. Used by docker-compose and load balancers.
 * Also the first proof that the wiring (DI, Prisma, global pipes) works end-to-end.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    let database = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {
      database = 'down';
    }
    return { status: 'ok', database };
  }
}
