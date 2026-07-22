import { IsEnum } from 'class-validator';
import { QuoteTemplate } from '@agencyos/shared';

export class UpdateInvoiceTemplateDto {
  @IsEnum(QuoteTemplate)
  template!: QuoteTemplate;
}
