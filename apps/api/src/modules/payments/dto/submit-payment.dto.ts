import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitPaymentDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  /** Transaction id / sender name the guest provides as proof of transfer. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reference?: string;
}
