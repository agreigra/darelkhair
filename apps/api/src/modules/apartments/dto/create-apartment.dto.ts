import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  LocalizedTextDto,
  PartialLocalizedTextDto,
} from './localized-text.dto';
import { ApartmentImageInputDto } from './apartment-image.dto';

export class CreateApartmentDto {
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  title!: LocalizedTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PartialLocalizedTextDto)
  description?: PartialLocalizedTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PartialLocalizedTextDto)
  address?: PartialLocalizedTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PartialLocalizedTextDto)
  city?: PartialLocalizedTextDto;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerNight!: number;

  @IsInt()
  @Min(0)
  @Max(50)
  bedrooms!: number;

  @IsInt()
  @Min(0)
  @Max(50)
  bathrooms!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  maxGuests!: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApartmentImageInputDto)
  images?: ApartmentImageInputDto[];
}
