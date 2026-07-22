import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@agencyos/shared';
import type { IInvoice } from '@agencyos/shared';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { UpdateInvoiceTemplateDto } from './dto/update-template.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const WRITE_ROLES = [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT] as const;

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  list(@CurrentUser('tenantId') tenantId: string): Promise<IInvoice[]> {
    return this.invoicesService.findAll(tenantId);
  }

  @Get(':id')
  get(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<IInvoice> {
    return this.invoicesService.findOne(tenantId, id);
  }

  @Roles(...WRITE_ROLES)
  @Post()
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvoiceDto,
  ): Promise<IInvoice> {
    return this.invoicesService.create(tenantId, userId, dto);
  }

  @Roles(...WRITE_ROLES)
  @Post('from-quote/:quoteId')
  fromQuote(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('quoteId') quoteId: string,
  ): Promise<IInvoice> {
    return this.invoicesService.createFromQuote(tenantId, userId, quoteId);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id')
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: CreateInvoiceDto,
  ): Promise<IInvoice> {
    return this.invoicesService.update(tenantId, id, dto);
  }

  @Roles(...WRITE_ROLES)
  @Patch(':id/template')
  updateTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceTemplateDto,
  ): Promise<IInvoice> {
    return this.invoicesService.updateTemplate(tenantId, id, dto.template);
  }

  @Roles(...WRITE_ROLES)
  @Post(':id/send')
  send(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<IInvoice> {
    return this.invoicesService.send(tenantId, id);
  }

  @Roles(...WRITE_ROLES)
  @Post(':id/payments')
  recordPayment(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ): Promise<IInvoice> {
    return this.invoicesService.recordPayment(tenantId, userId, id, dto);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @Post(':id/void')
  voidInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ): Promise<IInvoice> {
    return this.invoicesService.voidInvoice(tenantId, id);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string): Promise<void> {
    await this.invoicesService.remove(tenantId, id);
  }
}
