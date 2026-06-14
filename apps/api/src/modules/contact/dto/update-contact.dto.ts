import { ContactStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

/** Admin triage action — flip a message between NEW and HANDLED. */
export class UpdateContactDto {
  @IsEnum(ContactStatus)
  status!: ContactStatus;
}
