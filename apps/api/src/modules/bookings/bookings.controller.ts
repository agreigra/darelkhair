import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import type { BookingDto, PaginatedBookings } from './types/booking.types';

/**
 * Guest-facing booking routes. Secure-by-default (the global JwtAuthGuard) — a
 * signed-in user only ever sees / acts on their own bookings.
 */
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
    @Req() req: Request,
  ): Promise<BookingDto> {
    return this.bookings.create(userId, dto, this.context(req));
  }

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query() query: BookingQueryDto,
  ): Promise<PaginatedBookings> {
    return this.bookings.listMine(userId, query);
  }

  @Get(':id')
  getOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<BookingDto> {
    return this.bookings.getMine(userId, id);
  }

  @Patch(':id/cancel')
  cancel(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<BookingDto> {
    return this.bookings.cancelMine(userId, id, this.context(req));
  }

  private context(req: Request): RequestContext {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
