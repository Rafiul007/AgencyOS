import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { CatalogItemType, PricingUnit } from '@agencyos/shared';

export class CreateCatalogItemDto {
  @IsEnum(CatalogItemType)
  type!: CatalogItemType;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsEnum(PricingUnit)
  pricingUnit!: PricingUnit;

  /** Price in integer minor units (BDT poisha). */
  @IsInt()
  @Min(0)
  priceMinor!: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;
}
