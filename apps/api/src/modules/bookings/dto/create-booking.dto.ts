import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Matches, Max, Min } from 'class-validator';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  apartmentId!: string;

  @Matches(DATE_ONLY, { message: 'checkIn must be YYYY-MM-DD' })
  checkIn!: string;

  @Matches(DATE_ONLY, { message: 'checkOut must be YYYY-MM-DD' })
  checkOut!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  guests!: number;
}
