import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';
import type { DashboardOverview } from './types/dashboard.types';

/** Admin analytics overview (Feature 9). */
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  overview(): Promise<DashboardOverview> {
    return this.dashboard.overview();
  }
}
