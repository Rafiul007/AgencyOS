import { IsEnum } from 'class-validator';
import { QuoteTemplate } from '@agencyos/shared';

export class SetQuoteTemplateDto {
  @IsEnum(QuoteTemplate)
  defaultQuoteTemplate!: QuoteTemplate;
}
