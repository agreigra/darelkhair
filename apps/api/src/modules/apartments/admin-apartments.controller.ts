import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { ApartmentQueryDto } from './dto/apartment-query.dto';
import { ApartmentImageInputDto } from './dto/apartment-image.dto';
import type { ApartmentDto, PaginatedApartments } from './types/apartment.types';

/** Admin apartment management — includes unpublished drafts. ADMIN only. */
@Roles(UserRole.ADMIN)
@Controller('admin/apartments')
export class AdminApartmentsController {
  constructor(private readonly apartments: ApartmentsService) {}

  @Get()
  list(@Query() query: ApartmentQueryDto): Promise<PaginatedApartments> {
    return this.apartments.listAll(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<ApartmentDto> {
    return this.apartments.getById(id);
  }

  @Post()
  create(
    @Body() dto: CreateApartmentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ): Promise<ApartmentDto> {
    return this.apartments.create(dto, this.context(req), actorId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateApartmentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ): Promise<ApartmentDto> {
    return this.apartments.update(id, dto, this.context(req), actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.apartments.remove(id, this.context(req), actorId);
    return { success: true };
  }

  // ── images ──

  @Post(':id/images')
  addImage(
    @Param('id') id: string,
    @Body() dto: ApartmentImageInputDto,
  ): Promise<ApartmentDto> {
    return this.apartments.addImage(id, dto);
  }

  @Patch(':id/images/:imageId/cover')
  setCover(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ): Promise<ApartmentDto> {
    return this.apartments.setCover(id, imageId);
  }

  @Delete(':id/images/:imageId')
  removeImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ): Promise<ApartmentDto> {
    return this.apartments.removeImage(id, imageId);
  }

  private context(req: Request): RequestContext {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
