import { IsEnum } from 'class-validator';
import { QuoteTemplate } from '@agencyos/shared';

export class UpdateQuoteTemplateDto {
  @IsEnum(QuoteTemplate)
  template!: QuoteTemplate;
}
