import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactStatus, type ContactMessage, type Prisma } from '@prisma/client';
import { AuditService } from '@/common/audit/audit.service';
import { AppConfigService } from '@/config/app.config';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { ContactRepository } from './contact.repository';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import type {
  ContactInfo,
  ContactMessageDto,
  PaginatedContactMessages,
} from './types/contact.types';

@Injectable()
export class ContactService {
  constructor(
    private readonly repo: ContactRepository,
    private readonly audit: AuditService,
    private readonly config: AppConfigService,
  ) {}

  // ── public ──

  /** Static contact details for the public page (from validated config). */
  info(): ContactInfo {
    const { address, phone, email, whatsappNumber } = this.config.contact;
    return { address, phone, email, whatsappNumber };
  }

  async submit(
    dto: CreateContactDto,
    ctx: RequestContext,
  ): Promise<ContactMessageDto> {
    const created = await this.repo.create({
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    await this.audit.record({
      action: 'contact.submit',
      entity: 'ContactMessage',
      entityId: created.id,
      metadata: { email: dto.email, subject: dto.subject },
      ...ctx,
    });
    return this.toDto(created);
  }

  // ── admin ──

  async list(query: ContactQueryDto): Promise<PaginatedContactMessages> {
    const where: Prisma.ContactMessageWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { items, total } = await this.repo.list({
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      where,
    });

    return {
      items: items.map((m) => this.toDto(m)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getById(id: string): Promise<ContactMessageDto> {
    return this.toDto(await this.require(id));
  }

  async updateStatus(
    actorId: string,
    id: string,
    dto: UpdateContactDto,
    ctx: RequestContext,
  ): Promise<ContactMessageDto> {
    await this.require(id);
    const updated = await this.repo.update(id, {
      status: dto.status,
      handledAt: dto.status === ContactStatus.HANDLED ? new Date() : null,
    });
    await this.audit.record({
      action: 'contact.status_change',
      userId: actorId,
      entity: 'ContactMessage',
      entityId: id,
      metadata: { status: dto.status },
      ...ctx,
    });
    return this.toDto(updated);
  }

  async remove(actorId: string, id: string, ctx: RequestContext): Promise<void> {
    await this.require(id);
    await this.repo.delete(id);
    await this.audit.record({
      action: 'contact.delete',
      userId: actorId,
      entity: 'ContactMessage',
      entityId: id,
      ...ctx,
    });
  }

  // ── internals ──

  private async require(id: string): Promise<ContactMessage> {
    const message = await this.repo.findById(id);
    if (!message) {
      throw new NotFoundException('Contact message not found');
    }
    return message;
  }

  private toDto(m: ContactMessage): ContactMessageDto {
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      status: m.status,
      createdAt: m.createdAt,
      handledAt: m.handledAt,
    };
  }
}
