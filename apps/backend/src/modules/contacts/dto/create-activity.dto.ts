import { IsEnum, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContactActivityOutcome, ContactActivityType } from '@agencyos/shared';

export class CreateActivityDto {
  @IsEnum(ContactActivityType)
  type!: ContactActivityType;

  @IsOptional()
  @IsEnum(ContactActivityOutcome)
  outcome?: ContactActivityOutcome;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @IsOptional()
  @IsISO8601()
  nextFollowUpAt?: string;
}
