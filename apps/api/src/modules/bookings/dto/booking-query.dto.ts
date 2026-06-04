import { BookingStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Pagination + status filter for booking lists (the guest's own and admin's). */
export class BookingQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  /** Admin only — match a booking reference or the guest's email. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
