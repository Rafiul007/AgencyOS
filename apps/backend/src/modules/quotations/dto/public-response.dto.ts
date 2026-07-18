import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ApproveQuoteDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  signerName!: string;
}

export class RejectQuoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
