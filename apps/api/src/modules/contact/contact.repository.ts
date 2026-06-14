import { Injectable } from '@nestjs/common';
import type { ContactMessage, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ContactMessageCreateInput): Promise<ContactMessage> {
    return this.prisma.contactMessage.create({ data });
  }

  findById(id: string): Promise<ContactMessage | null> {
    return this.prisma.contactMessage.findUnique({ where: { id } });
  }

  update(
    id: string,
    data: Prisma.ContactMessageUpdateInput,
  ): Promise<ContactMessage> {
    return this.prisma.contactMessage.update({ where: { id }, data });
  }

  delete(id: string): Promise<ContactMessage> {
    return this.prisma.contactMessage.delete({ where: { id } });
  }

  /** Paginated, filtered list for the admin inbox. Returns the page + total. */
  async list(params: {
    skip: number;
    take: number;
    where: Prisma.ContactMessageWhereInput;
  }): Promise<{ items: ContactMessage[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count({ where: params.where }),
    ]);
    return { items, total };
  }
}
