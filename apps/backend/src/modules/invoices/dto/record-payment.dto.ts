import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaymentMethod } from '@agencyos/shared';

export class RecordPaymentDto {
  /** Amount received, in integer minor units (BDT poisha). */
  @IsInt()
  @Min(1)
  amountMinor!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  /** Transaction / reference number (e.g. bKash TrxID, cheque no.). */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @IsOptional()
  @IsISO8601()
  paidAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
