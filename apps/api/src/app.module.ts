import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';

/**
 * Root module. Each FEATURE is its own module under src/modules and gets
 * imported here as it is built (auth, users, apartments, …). Feature modules
 * own their controllers/services/repositories/DTOs — boundaries are never crossed.
 */
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    HealthModule,
    // ── Features (added one at a time, in plan order) ──
    // AuthModule,
    // UsersModule,
    // ApartmentsModule,
    // AvailabilityModule,
    // BookingsModule,
    // PaymentsModule,
    // UploadsModule,
    // NotificationsModule,
    // DashboardModule,
  ],
})
export class AppModule {}
