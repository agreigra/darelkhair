import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * A translatable field with all locales required (e.g. apartment title).
 * Stored as JSON `{ fr, ar, en }`. The admin form's per-language tabs fill these.
 */
export class LocalizedTextDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  fr!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  ar!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  en!: string;
}

/**
 * A translatable field where each locale is optional (e.g. description, city).
 * The frontend `localized()` helper falls back across locales at render time.
 */
export class PartialLocalizedTextDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  fr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  en?: string;
}
