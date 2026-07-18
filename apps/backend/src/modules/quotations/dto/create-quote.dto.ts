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

export class QuoteLineDto {
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

export class CreateQuoteDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  terms?: string;

  /** Whole-percent VAT rate (e.g. 15 = 15%). 0 = no tax. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  taxRatePercent?: number;

  /** Overall (quote-level) discount in minor units. */
  @IsOptional()
  @IsInt()
  @Min(0)
  discountMinor?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuoteLineDto)
  lines!: QuoteLineDto[];
}
