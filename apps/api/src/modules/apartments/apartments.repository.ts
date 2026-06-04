import { Injectable } from '@nestjs/common';
import type { ApartmentImage, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

export type ApartmentWithImages = Prisma.ApartmentGetPayload<{
  include: { images: true };
}>;

@Injectable()
export class ApartmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly imageOrder: Prisma.ApartmentImageOrderByWithRelationInput[] = [
    { isCover: 'desc' },
    { sortOrder: 'asc' },
  ];

  create(
    data: Prisma.ApartmentCreateInput,
  ): Promise<ApartmentWithImages> {
    return this.prisma.apartment.create({
      data,
      include: { images: { orderBy: this.imageOrder } },
    });
  }

  findById(id: string): Promise<ApartmentWithImages | null> {
    return this.prisma.apartment.findUnique({
      where: { id },
      include: { images: { orderBy: this.imageOrder } },
    });
  }

  update(
    id: string,
    data: Prisma.ApartmentUpdateInput,
  ): Promise<ApartmentWithImages> {
    return this.prisma.apartment.update({
      where: { id },
      data,
      include: { images: { orderBy: this.imageOrder } },
    });
  }

  delete(id: string): Promise<{ id: string }> {
    return this.prisma.apartment.delete({
      where: { id },
      select: { id: true },
    });
  }

  async list(params: {
    where: Prisma.ApartmentWhereInput;
    skip: number;
    take: number;
  }): Promise<{ items: ApartmentWithImages[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.apartment.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: { images: { orderBy: this.imageOrder } },
      }),
      this.prisma.apartment.count({ where: params.where }),
    ]);
    return { items, total };
  }

  addImage(
    apartmentId: string,
    data: Omit<Prisma.ApartmentImageUncheckedCreateInput, 'apartmentId'>,
  ): Promise<ApartmentImage> {
    return this.prisma.apartmentImage.create({
      data: { ...data, apartmentId },
    });
  }

  findImage(imageId: string): Promise<ApartmentImage | null> {
    return this.prisma.apartmentImage.findUnique({ where: { id: imageId } });
  }

  removeImage(imageId: string): Promise<{ id: string }> {
    return this.prisma.apartmentImage.delete({
      where: { id: imageId },
      select: { id: true },
    });
  }

  /** Make one image the cover, clearing the flag on the apartment's other images. */
  async setCover(apartmentId: string, imageId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.apartmentImage.updateMany({
        where: { apartmentId, isCover: true },
        data: { isCover: false },
      }),
      this.prisma.apartmentImage.update({
        where: { id: imageId },
        data: { isCover: true },
      }),
    ]);
  }
}
