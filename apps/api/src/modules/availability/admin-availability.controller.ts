import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { AvailabilityService } from './availability.service';
import { CreateBlockDto } from './dto/create-block.dto';
import type { AvailabilitySlotDto } from './types/availability.types';

/** Admin availability management — block / unblock date ranges. ADMIN only. */
@Roles(UserRole.ADMIN)
@Controller('admin/apartments/:apartmentId/availability')
export class AdminAvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get()
  list(
    @Param('apartmentId') apartmentId: string,
  ): Promise<AvailabilitySlotDto[]> {
    return this.availability.listSlots(apartmentId);
  }

  @Post()
  createBlock(
    @Param('apartmentId') apartmentId: string,
    @Body() dto: CreateBlockDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ): Promise<AvailabilitySlotDto> {
    return this.availability.createBlock(
      apartmentId,
      dto,
      this.context(req),
      actorId,
    );
  }

  @Delete(':slotId')
  @HttpCode(HttpStatus.OK)
  async deleteSlot(
    @Param('apartmentId') apartmentId: string,
    @Param('slotId') slotId: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.availability.deleteSlot(
      apartmentId,
      slotId,
      this.context(req),
      actorId,
    );
    return { success: true };
  }

  private context(req: Request): RequestContext {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
