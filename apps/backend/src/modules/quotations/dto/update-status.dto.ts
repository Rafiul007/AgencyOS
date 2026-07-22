import { IsEnum } from 'class-validator';
import { QuoteStatus } from '@agencyos/shared';

export class UpdateQuoteStatusDto {
  @IsEnum(QuoteStatus)
  status!: QuoteStatus;
}
