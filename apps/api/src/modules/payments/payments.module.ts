import { Module } from '@nestjs/common';
import { BookingsModule } from '@/modules/bookings/bookings.module';
import {
  BookingPaymentController,
  PaymentsController,
} from './payments.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';

@Module({
  // BookingsModule exports BookingsService — payments drive booking transitions.
  imports: [BookingsModule],
  controllers: [
    PaymentsController,
    BookingPaymentController,
    AdminPaymentsController,
  ],
  providers: [PaymentsService, PaymentsRepository],
  exports: [PaymentsService],
})
export class PaymentsModule {}
