import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateApartmentDto } from './create-apartment.dto';

/**
 * All create fields become optional. Images are managed via dedicated
 * /images endpoints, so they're omitted from the update body.
 */
export class UpdateApartmentDto extends PartialType(
  OmitType(CreateApartmentDto, ['images'] as const),
) {}
