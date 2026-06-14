import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './common/audit/audit.module';
import { StorageModule } from './common/storage/storage.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ApartmentsModule } from './modules/apartments/apartments.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ContactModule } from './modules/contact/contact.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

/**
 * Root module. Each FEATURE is its own module under src/modules and gets
 * imported here as it is built (auth, users, apartments, …). Feature modules
 * own their controllers/services/repositories/DTOs — boundaries are never crossed.
 */
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuditModule,
    NotificationsModule,
    StorageModule,
    HealthModule,
    // ── Features (added one at a time, in plan order) ──
    AuthModule,
    UsersModule,
    ApartmentsModule,
    AvailabilityModule,
    BookingsModule,
    PaymentsModule,
    ContactModule,
    DashboardModule,
    ReviewsModule,
    // UploadsModule,
  ],
})
export class AppModule {}
