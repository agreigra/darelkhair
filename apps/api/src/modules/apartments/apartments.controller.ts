import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { ApartmentsService } from './apartments.service';
import { ApartmentQueryDto } from './dto/apartment-query.dto';
import type { ApartmentDto, PaginatedApartments } from './types/apartment.types';

/** Public, read-only apartment browsing. Only published apartments are exposed. */
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartments: ApartmentsService) {}

  @Public()
  @Get()
  list(@Query() query: ApartmentQueryDto): Promise<PaginatedApartments> {
    return this.apartments.listPublished(query);
  }

  @Public()
  @Get(':id')
  getOne(@Param('id') id: string): Promise<ApartmentDto> {
    return this.apartments.getPublished(id);
  }
}
