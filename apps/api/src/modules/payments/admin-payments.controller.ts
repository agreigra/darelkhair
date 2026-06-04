import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { PaymentsService } from './payments.service';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import type { AdminPaymentDto, PaginatedPayments } from './types/payment.types';

@Roles(UserRole.ADMIN)
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  list(@Query() query: PaymentQueryDto): Promise<PaginatedPayments> {
    return this.payments.adminList(query);
  }

  @Get('by-booking/:bookingId')
  getForBooking(
    @Param('bookingId') bookingId: string,
  ): Promise<AdminPaymentDto | null> {
    return this.payments.adminGetForBooking(bookingId);
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<AdminPaymentDto> {
    return this.payments.adminGet(id);
  }

  @Patch(':id/verify')
  verify(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ): Promise<AdminPaymentDto> {
    return this.payments.verify(id, actorId, this.context(req));
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ): Promise<AdminPaymentDto> {
    return this.payments.reject(id, dto, actorId, this.context(req));
  }

  private context(req: Request): RequestContext {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
