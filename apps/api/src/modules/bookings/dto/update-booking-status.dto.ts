import { BookingStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/** Admin transition of a booking to a new status (validated against the machine). */
export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
