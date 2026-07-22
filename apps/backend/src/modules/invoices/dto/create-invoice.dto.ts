import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class InvoiceLineDto {
  @IsOptional()
  @IsString()
  catalogItemId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(400)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  /** Unit price in integer minor units (BDT poisha). */
  @IsInt()
  @Min(0)
  unitPriceMinor!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lineDiscountMinor?: number;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  /** Manual recipient name when the invoice isn't linked to a saved client. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerName?: string;

  @IsOptional()
  @IsISO8601()
  issueDate?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  terms?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  taxRatePercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discountMinor?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines!: InvoiceLineDto[];
}
