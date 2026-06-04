import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AvailabilitySlot } from '@prisma/client';
import { AuditService } from '@/common/audit/audit.service';
import { formatDateOnly, parseDateOnly } from '@/common/utils/date';
import type { RequestContext } from '@/modules/auth/types/auth.types';
import { AvailabilityRepository } from './availability.repository';
import { CreateBlockDto } from './dto/create-block.dto';
import {
  AvailabilityQueryDto,
  CheckAvailabilityDto,
} from './dto/availability-query.dto';
import type {
  AvailabilityCheckResult,
  AvailabilitySlotDto,
  UnavailableRange,
} from './types/availability.types';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly repo: AvailabilityRepository,
    private readonly audit: AuditService,
  ) {}

  /** Unavailable ranges (admin blocks + active bookings) within a window. */
  async getUnavailableRanges(
    apartmentId: string,
    query: AvailabilityQueryDto,
  ): Promise<UnavailableRange[]> {
    await this.ensureApartment(apartmentId);
    const window = {
      start: parseDateOnly(query.from),
      end: parseDateOnly(query.to),
    };

    const [blocks, bookings] = await Promise.all([
      this.repo.blocksInWindow(apartmentId, window),
      this.repo.bookingsInWindow(apartmentId, window),
    ]);

    return [
      ...blocks.map(
        (b): UnavailableRange => ({
          start: formatDateOnly(b.startDate),
          end: formatDateOnly(b.endDate),
          type: 'blocked',
        }),
      ),
      ...bookings.map(
        (bk): UnavailableRange => ({
          start: formatDateOnly(bk.checkIn),
          end: formatDateOnly(bk.checkOut),
          type: 'booked',
        }),
      ),
    ];
  }

  /** Is the stay [checkIn, checkOut) bookable? Used by the booking flow (Feature 5). */
  async check(
    apartmentId: string,
    query: CheckAvailabilityDto,
  ): Promise<AvailabilityCheckResult> {
    await this.ensureApartment(apartmentId);
    const checkIn = parseDateOnly(query.checkIn);
    const checkOut = parseDateOnly(query.checkOut);
    if (checkOut.getTime() <= checkIn.getTime()) {
      throw new BadRequestException('checkOut must be after checkIn');
    }

    const block = await this.repo.blockOverlapping(
      apartmentId,
      checkIn,
      checkOut,
    );
    if (block) return { available: false, reason: 'blocked' };

    const booking = await this.repo.bookingOverlapping(
      apartmentId,
      checkIn,
      checkOut,
    );
    if (booking) return { available: false, reason: 'booked' };

    return { available: true };
  }

  // ── admin ──

  async listSlots(apartmentId: string): Promise<AvailabilitySlotDto[]> {
    await this.ensureApartment(apartmentId);
    const slots = await this.repo.listBlocks(apartmentId);
    return slots.map((s) => this.toDto(s));
  }

  async createBlock(
    apartmentId: string,
    dto: CreateBlockDto,
    ctx: RequestContext,
    actorId: string,
  ): Promise<AvailabilitySlotDto> {
    await this.ensureApartment(apartmentId);
    const startDate = parseDateOnly(dto.startDate);
    const endDate = parseDateOnly(dto.endDate);
    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    const slot = await this.repo.createBlock(apartmentId, startDate, endDate);
    await this.audit.record({
      action: 'availability.block_create',
      userId: actorId,
      entity: 'AvailabilitySlot',
      entityId: slot.id,
      metadata: { apartmentId, startDate: dto.startDate, endDate: dto.endDate },
      ...ctx,
    });
    return this.toDto(slot);
  }

  async deleteSlot(
    apartmentId: string,
    slotId: string,
    ctx: RequestContext,
    actorId: string,
  ): Promise<void> {
    await this.ensureApartment(apartmentId);
    const slot = await this.repo.findSlot(slotId);
    if (!slot || slot.apartmentId !== apartmentId) {
      throw new NotFoundException('Availability slot not found');
    }
    await this.repo.deleteSlot(slotId);
    await this.audit.record({
      action: 'availability.block_delete',
      userId: actorId,
      entity: 'AvailabilitySlot',
      entityId: slotId,
      ...ctx,
    });
  }

  // ── internals ──

  private async ensureApartment(id: string): Promise<void> {
    const exists = await this.repo.apartmentExists(id);
    if (!exists) {
      throw new NotFoundException('Apartment not found');
    }
  }

  private toDto(slot: AvailabilitySlot): AvailabilitySlotDto {
    return {
      id: slot.id,
      startDate: formatDateOnly(slot.startDate),
      endDate: formatDateOnly(slot.endDate),
      isAvailable: slot.isAvailable,
    };
  }
}
