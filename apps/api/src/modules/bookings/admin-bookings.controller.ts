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
import { BookingsService } from './bookings.service';
import { BookingQueryDto } from './dto/booking-query.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import type { BookingDto, PaginatedBookings } from './types/booking.types';

@Roles(UserRole.ADMIN)
@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  list(@Query() query: BookingQueryDto): Promise<PaginatedBookings> {
    return this.bookings.adminList(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<BookingDto> {
    return this.bookings.adminGet(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ): Promise<BookingDto> {
    return this.bookings.adminUpdateStatus(id, dto, actorId, this.context(req));
  }

  private context(req: Request): RequestContext {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
