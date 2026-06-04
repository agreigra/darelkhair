import { Module } from '@nestjs/common';
import { AvailabilityModule } from '@/modules/availability/availability.module';
import { BookingsController } from './bookings.controller';
import { AdminBookingsController } from './admin-bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './bookings.repository';

@Module({
  // AvailabilityModule exports AvailabilityService — reused for overlap checks.
  imports: [AvailabilityModule],
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService, BookingsRepository],
  exports: [BookingsService],
})
export class BookingsModule {}
