import { Body, Controller, Get, Ip, Param, Post } from '@nestjs/common';
import type { IPublicQuote } from '@agencyos/shared';
import { QuotationsService } from './quotations.service';
import { ApproveQuoteDto, RejectQuoteDto } from './dto/public-response.dto';
import { Public } from '../auth/decorators/public.decorator';

/** Client-facing, token-based quote endpoints — no login required. */
@Controller('public/quotations')
export class PublicQuotesController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Public()
  @Get(':token')
  view(@Param('token') token: string): Promise<IPublicQuote> {
    return this.quotationsService.getPublicByToken(token);
  }

  @Public()
  @Post(':token/approve')
  approve(
    @Param('token') token: string,
    @Body() dto: ApproveQuoteDto,
    @Ip() ip: string,
  ): Promise<IPublicQuote> {
    return this.quotationsService.approvePublic(token, dto.signerName, ip);
  }

  @Public()
  @Post(':token/reject')
  reject(
    @Param('token') token: string,
    @Body() dto: RejectQuoteDto,
    @Ip() ip: string,
  ): Promise<IPublicQuote> {
    return this.quotationsService.rejectPublic(token, dto.reason, ip);
  }
}
