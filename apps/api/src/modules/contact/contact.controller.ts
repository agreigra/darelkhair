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
import { Public } from '@/modules/auth/decorators/public.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import type {
  ContactInfo,
  ContactMessageDto,
  PaginatedContactMessages,
} from './types/contact.types';

@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  // ── public ──

  @Public()
  @Get('info')
  info(): ContactInfo {
    return this.contact.info();
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  submit(
    @Body() dto: CreateContactDto,
    @Req() req: Request,
  ): Promise<ContactMessageDto> {
    return this.contact.submit(dto, this.context(req));
  }

  // ── admin ──

  @Roles(UserRole.ADMIN)
  @Get()
  list(@Query() query: ContactQueryDto): Promise<PaginatedContactMessages> {
    return this.contact.list(query);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  getById(@Param('id') id: string): Promise<ContactMessageDto> {
    return this.contact.getById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  updateStatus(
    @CurrentUser('id') actorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @Req() req: Request,
  ): Promise<ContactMessageDto> {
    return this.contact.updateStatus(actorId, id, dto, this.context(req));
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser('id') actorId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    await this.contact.remove(actorId, id, this.context(req));
    return { success: true };
  }

  private context(req: Request): RequestContext {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
