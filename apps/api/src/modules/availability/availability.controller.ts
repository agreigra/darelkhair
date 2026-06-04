import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { AvailabilityService } from './availability.service';
import {
  AvailabilityQueryDto,
  CheckAvailabilityDto,
} from './dto/availability-query.dto';
import type {
  AvailabilityCheckResult,
  UnavailableRange,
} from './types/availability.types';

/** Public availability: unavailable ranges for the calendar + stay check. */
@Controller('apartments/:apartmentId/availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Public()
  @Get()
  unavailable(
    @Param('apartmentId') apartmentId: string,
    @Query() query: AvailabilityQueryDto,
  ): Promise<UnavailableRange[]> {
    return this.availability.getUnavailableRanges(apartmentId, query);
  }

  @Public()
  @Get('check')
  check(
    @Param('apartmentId') apartmentId: string,
    @Query() query: CheckAvailabilityDto,
  ): Promise<AvailabilityCheckResult> {
    return this.availability.check(apartmentId, query);
  }
}
