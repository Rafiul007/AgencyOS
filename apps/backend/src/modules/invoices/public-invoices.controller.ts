import { Controller, Get, Param } from '@nestjs/common';
import type { IPublicInvoice } from '@agencyos/shared';
import { InvoicesService } from './invoices.service';
import { Public } from '../auth/decorators/public.decorator';

/** Client-facing, token-based invoice endpoint — no login required. */
@Controller('public/invoices')
export class PublicInvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Public()
  @Get(':token')
  view(@Param('token') token: string): Promise<IPublicInvoice> {
    return this.invoicesService.getPublicByToken(token);
  }
}
