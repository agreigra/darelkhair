import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '@/common/audit/audit.service';
import { StorageService } from '@/common/storage/storage.service';
import { AppConfigService } from '@/config/app.config';
import type { LocalizedText } from '@/common/i18n/localized-text';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import {
  ApartmentsRepository,
  type ApartmentWithImages,
} from './apartments.repository';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { ApartmentQueryDto } from './dto/apartment-query.dto';
import { ApartmentImageInputDto } from './dto/apartment-image.dto';
import type {
  ApartmentDto,
  ApartmentImageDto,
  PaginatedApartments,
} from './types/apartment.types';

@Injectable()
export class ApartmentsService {
  private readonly logger = new Logger(ApartmentsService.name);

  constructor(
    private readonly repo: ApartmentsRepository,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
    private readonly config: AppConfigService,
  ) {}

  // ── public ──

  listPublished(query: ApartmentQueryDto): Promise<PaginatedApartments> {
    return this.runList(query, true);
  }

  async getPublished(id: string): Promise<ApartmentDto> {
    const apartment = await this.repo.findById(id);
    if (!apartment || !apartment.isPublished) {
      throw new NotFoundException('Apartment not found');
    }
    return this.toDto(apartment);
  }

  // ── admin ──

  listAll(query: ApartmentQueryDto): Promise<PaginatedApartments> {
    return this.runList(query, false);
  }

  async getById(id: string): Promise<ApartmentDto> {
    return this.toDto(await this.requireApartment(id));
  }

  async create(
    dto: CreateApartmentDto,
    ctx: RequestContext,
    actorId: string,
  ): Promise<ApartmentDto> {
    const data: Prisma.ApartmentCreateInput = {
      title: this.json(dto.title),
      description: this.optionalJson(dto.description),
      address: this.optionalJson(dto.address),
      city: this.optionalJson(dto.city),
      pricePerNight: new Prisma.Decimal(dto.pricePerNight),
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      maxGuests: dto.maxGuests,
      isPublished: dto.isPublished ?? false,
      images: dto.images?.length
        ? { create: dto.images.map((img, i) => this.imageCreate(img, i)) }
        : undefined,
    };

    const apartment = await this.repo.create(data);
    await this.audit.record({
      action: 'apartment.create',
      userId: actorId,
      entity: 'Apartment',
      entityId: apartment.id,
      ...ctx,
    });
    return this.toDto(apartment);
  }

  async update(
    id: string,
    dto: UpdateApartmentDto,
    ctx: RequestContext,
    actorId: string,
  ): Promise<ApartmentDto> {
    await this.requireApartment(id);

    const data: Prisma.ApartmentUpdateInput = {
      title: dto.title ? this.json(dto.title) : undefined,
      description: dto.description ? this.json(dto.description) : undefined,
      address: dto.address ? this.json(dto.address) : undefined,
      city: dto.city ? this.json(dto.city) : undefined,
      pricePerNight:
        dto.pricePerNight !== undefined
          ? new Prisma.Decimal(dto.pricePerNight)
          : undefined,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      maxGuests: dto.maxGuests,
      isPublished: dto.isPublished,
    };

    const apartment = await this.repo.update(id, data);
    await this.audit.record({
      action: 'apartment.update',
      userId: actorId,
      entity: 'Apartment',
      entityId: id,
      ...ctx,
    });
    return this.toDto(apartment);
  }

  async remove(
    id: string,
    ctx: RequestContext,
    actorId: string,
  ): Promise<void> {
    await this.requireApartment(id);
    await this.repo.delete(id);
    await this.audit.record({
      action: 'apartment.delete',
      userId: actorId,
      entity: 'Apartment',
      entityId: id,
      ...ctx,
    });
  }

  // ── images ──

  /** Register an externally-hosted image by URL (no storage object). */
  async addImage(
    apartmentId: string,
    dto: ApartmentImageInputDto,
  ): Promise<ApartmentDto> {
    const apartment = await this.requireApartment(apartmentId);
    await this.repo.addImage(apartmentId, {
      url: dto.url,
      alt: dto.alt ?? null,
      isCover: dto.isCover ?? apartment.images.length === 0,
      sortOrder: dto.sortOrder ?? apartment.images.length,
    });
    return this.toDto(await this.requireApartment(apartmentId));
  }

  /** Upload a file to storage (R2/local) and attach it as an apartment image. */
  async uploadImage(
    apartmentId: string,
    file: Express.Multer.File | undefined,
  ): Promise<ApartmentDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const extension = this.storage.extensionFor(file.mimetype);
    if (!extension) {
      throw new BadRequestException(
        `Unsupported file type. Allowed: ${this.storage.allowedMimeTypes.join(', ')}`,
      );
    }
    const maxBytes = this.config.storage.maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `File too large (max ${this.config.storage.maxSizeMb} MB)`,
      );
    }

    const apartment = await this.requireApartment(apartmentId);
    const { url, key } = await this.storage.upload({
      buffer: file.buffer,
      contentType: file.mimetype,
      keyPrefix: `apartments/${apartmentId}`,
      extension,
    });

    await this.repo.addImage(apartmentId, {
      url,
      storageKey: key,
      isCover: apartment.images.length === 0,
      sortOrder: apartment.images.length,
    });
    return this.toDto(await this.requireApartment(apartmentId));
  }

  async removeImage(
    apartmentId: string,
    imageId: string,
  ): Promise<ApartmentDto> {
    await this.requireApartment(apartmentId);
    const image = await this.repo.findImage(imageId);
    if (!image || image.apartmentId !== apartmentId) {
      throw new NotFoundException('Image not found');
    }
    // Best-effort delete from storage; never block the DB removal on it.
    if (image.storageKey) {
      try {
        await this.storage.delete(image.storageKey);
      } catch (err) {
        this.logger.warn(
          `Failed to delete storage object ${image.storageKey}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
    await this.repo.removeImage(imageId);
    return this.toDto(await this.requireApartment(apartmentId));
  }

  async setCover(apartmentId: string, imageId: string): Promise<ApartmentDto> {
    await this.requireApartment(apartmentId);
    const image = await this.repo.findImage(imageId);
    if (!image || image.apartmentId !== apartmentId) {
      throw new NotFoundException('Image not found');
    }
    await this.repo.setCover(apartmentId, imageId);
    return this.toDto(await this.requireApartment(apartmentId));
  }

  // ── internals ──

  private async runList(
    query: ApartmentQueryDto,
    publishedOnly: boolean,
  ): Promise<PaginatedApartments> {
    const where = this.buildWhere(query, publishedOnly);
    const { items, total } = await this.repo.list({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return {
      items: items.map((a) => this.toDto(a)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  private buildWhere(
    query: ApartmentQueryDto,
    publishedOnly: boolean,
  ): Prisma.ApartmentWhereInput {
    const where: Prisma.ApartmentWhereInput = {};
    if (publishedOnly) where.isPublished = true;

    if (query.search) {
      const s = query.search;
      // jsonb `string_contains` across each locale of title + city.
      where.OR = (['fr', 'ar', 'en'] as const).flatMap((loc) => [
        { title: { path: [loc], string_contains: s } },
        { city: { path: [loc], string_contains: s } },
      ]);
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.pricePerNight = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    if (query.guests !== undefined) {
      where.maxGuests = { gte: query.guests };
    }

    return where;
  }

  /** Cast a plain object to Prisma's JSON input type (DTOs lack an index signature). */
  private json(value: object): Prisma.InputJsonValue {
    return value as unknown as Prisma.InputJsonValue;
  }

  private optionalJson(
    value: object | undefined,
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    return value ? this.json(value) : Prisma.JsonNull;
  }

  private imageCreate(
    img: ApartmentImageInputDto,
    index: number,
  ): Prisma.ApartmentImageCreateWithoutApartmentInput {
    return {
      url: img.url,
      alt: img.alt ?? null,
      isCover: img.isCover ?? index === 0,
      sortOrder: img.sortOrder ?? index,
    };
  }

  private async requireApartment(id: string): Promise<ApartmentWithImages> {
    const apartment = await this.repo.findById(id);
    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }
    return apartment;
  }

  private toDto(a: ApartmentWithImages): ApartmentDto {
    const images: ApartmentImageDto[] = a.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isCover: img.isCover,
      sortOrder: img.sortOrder,
    }));
    const cover = images.find((i) => i.isCover) ?? images[0];

    return {
      id: a.id,
      title: (a.title ?? {}) as LocalizedText,
      description: (a.description as LocalizedText | null) ?? null,
      address: (a.address as LocalizedText | null) ?? null,
      city: (a.city as LocalizedText | null) ?? null,
      pricePerNight: Number(a.pricePerNight),
      bedrooms: a.bedrooms,
      bathrooms: a.bathrooms,
      maxGuests: a.maxGuests,
      isPublished: a.isPublished,
      images,
      coverImageUrl: cover?.url ?? null,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }
}
