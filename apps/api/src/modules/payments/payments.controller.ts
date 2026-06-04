import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { imageUploadOptions } from '@/common/storage/image-upload';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { PaymentsService } from './payments.service';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import type { PaymentDto, PaymentInstructions } from './types/payment.types';

/** Public payment instructions (bank / mobile money / WhatsApp). */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Public()
  @Get('instructions')
  instructions(): PaymentInstructions {
    return this.payments.instructions();
  }
}

/** Guest payment for a specific booking (owner-only). */
@Controller('bookings/:bookingId/payment')
export class BookingPaymentController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  get(
    @CurrentUser('id') userId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<PaymentDto | null> {
    return this.payments.getForBooking(userId, bookingId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('proof', imageUploadOptions))
  submit(
    @CurrentUser('id') userId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: SubmitPaymentDto,
    @UploadedFile() proof: Express.Multer.File | undefined,
    @Req() req: Request,
  ): Promise<PaymentDto> {
    return this.payments.submit(userId, bookingId, dto, proof, this.context(req));
  }

  private context(req: Request): RequestContext {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
