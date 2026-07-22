import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { Prisma } from '@prisma/client';
import {
  DEFAULT_QUOTE_TEMPLATE,
  InvoiceEventType,
  InvoiceStatus,
  PaymentMethod,
  QuoteEventType,
  QuoteStatus,
  QuoteTemplate,
} from '@agencyos/shared';
import type { IInvoice, IPayment, IPublicInvoice } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

const DETAIL_INCLUDE = {
  client: true,
  tenant: true,
  quote: { select: { number: true } },
  lineItems: { orderBy: { sortOrder: 'asc' as const } },
  payments: {
    orderBy: { paidAt: 'desc' as const },
    include: { recordedBy: { select: { name: true } } },
  },
  events: { orderBy: { createdAt: 'desc' as const } },
} satisfies Prisma.InvoiceInclude;

type InvoiceDetail = Prisma.InvoiceGetPayload<{ include: typeof DETAIL_INCLUDE }>;

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateInvoiceDto): Promise<IInvoice> {
    const computed = this.computeTotals(dto);
    const invoice = await this.prisma.$transaction(async (tx) => {
      const number = await this.nextNumber(tx, tenantId);
      return tx.invoice.create({
        data: {
          tenantId,
          number,
          clientId: dto.clientId ?? null,
          customerName: dto.clientId ? null : dto.customerName?.trim() || null,
          status: InvoiceStatus.DRAFT,
          currency: 'BDT',
          issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          note: dto.note?.trim(),
          terms: dto.terms?.trim(),
          taxRatePercent: computed.taxRatePercent,
          discountMinor: computed.discountMinor,
          subtotalMinor: computed.subtotalMinor,
          taxMinor: computed.taxMinor,
          totalMinor: computed.totalMinor,
          createdById: userId,
          lineItems: { create: computed.lines },
          events: { create: { type: InvoiceEventType.CREATED } },
        },
        include: DETAIL_INCLUDE,
      });
    });
    return this.toDto(invoice, true);
  }

  /** Creates an invoice from an accepted quote and marks that quote as converted (ACID). */
  async createFromQuote(tenantId: string, userId: string, quoteId: string): Promise<IInvoice> {
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, tenantId },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } }, invoice: true },
    });
    if (!quote) {
      throw new NotFoundException({ message: 'Quotation not found', error: 'QUOTE_NOT_FOUND' });
    }
    if (quote.invoice) {
      throw new BadRequestException({
        message: 'This quotation already has an invoice',
        error: 'QUOTE_ALREADY_INVOICED',
      });
    }
    // Convert from an accepted quote, or a legacy quote already marked converted
    // that never got an invoice.
    if (quote.status !== QuoteStatus.ACCEPTED && quote.status !== QuoteStatus.CONVERTED) {
      throw new BadRequestException({
        message: 'Only an accepted quotation can be converted to an invoice',
        error: 'QUOTE_NOT_ACCEPTED',
      });
    }

    const invoice = await this.prisma.$transaction(async (tx) => {
      const number = await this.nextNumber(tx, tenantId);
      const created = await tx.invoice.create({
        data: {
          tenantId,
          number,
          clientId: quote.clientId,
          customerName: quote.clientId ? null : quote.customerName,
          quoteId: quote.id,
          status: InvoiceStatus.DRAFT,
          currency: quote.currency,
          template: quote.template,
          dueDate: null,
          note: quote.note,
          terms: quote.terms,
          taxRatePercent: quote.taxRatePercent,
          discountMinor: quote.discountMinor,
          subtotalMinor: quote.subtotalMinor,
          taxMinor: quote.taxMinor,
          totalMinor: quote.totalMinor,
          createdById: userId,
          lineItems: {
            create: quote.lineItems.map((l) => ({
              catalogItemId: l.catalogItemId,
              description: l.description,
              unit: l.unit,
              quantity: l.quantity,
              unitPriceMinor: l.unitPriceMinor,
              lineDiscountMinor: l.lineDiscountMinor,
              lineTotalMinor: l.lineTotalMinor,
              sortOrder: l.sortOrder,
            })),
          },
          events: {
            create: { type: InvoiceEventType.CREATED, message: `From quote ${quote.number}` },
          },
        },
        include: DETAIL_INCLUDE,
      });
      await tx.quote.update({ where: { id: quote.id }, data: { status: QuoteStatus.CONVERTED } });
      await tx.quoteEvent.create({ data: { quoteId: quote.id, type: QuoteEventType.CONVERTED } });
      return created;
    });
    return this.toDto(invoice, true);
  }

  async findAll(tenantId: string): Promise<IInvoice[]> {
    const [tenant, invoices] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { id: tenantId } }),
      this.prisma.invoice.findMany({
        where: { tenantId },
        include: { client: true, quote: { select: { number: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return invoices.map((i) => this.toDto(i, false, tenant?.defaultQuoteTemplate));
  }

  async findOne(tenantId: string, id: string): Promise<IInvoice> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: DETAIL_INCLUDE,
    });
    if (!invoice) {
      throw new NotFoundException({ message: 'Invoice not found', error: 'INVOICE_NOT_FOUND' });
    }
    return this.toDto(invoice, true);
  }

  /** Edits a DRAFT invoice in place (replaces line items and recomputes totals). */
  async update(tenantId: string, id: string, dto: CreateInvoiceDto): Promise<IInvoice> {
    const existing = await this.getOwned(tenantId, id);
    if (existing.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException({
        message: 'Only draft invoices can be edited',
        error: 'INVOICE_NOT_EDITABLE',
      });
    }
    const computed = this.computeTotals(dto);
    await this.prisma.$transaction(async (tx) => {
      await tx.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
      await tx.invoice.update({
        where: { id },
        data: {
          clientId: dto.clientId ?? null,
          customerName: dto.clientId ? null : dto.customerName?.trim() || null,
          issueDate: dto.issueDate ? new Date(dto.issueDate) : existing.issueDate,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          note: dto.note?.trim(),
          terms: dto.terms?.trim(),
          taxRatePercent: computed.taxRatePercent,
          discountMinor: computed.discountMinor,
          subtotalMinor: computed.subtotalMinor,
          taxMinor: computed.taxMinor,
          totalMinor: computed.totalMinor,
          lineItems: { create: computed.lines },
        },
      });
    });
    return this.findOne(tenantId, id);
  }

  async updateTemplate(tenantId: string, id: string, template: QuoteTemplate): Promise<IInvoice> {
    await this.getOwned(tenantId, id);
    await this.prisma.invoice.update({ where: { id }, data: { template } });
    return this.findOne(tenantId, id);
  }

  /** Marks the invoice as sent and ensures it has a public link. */
  async send(tenantId: string, id: string): Promise<IInvoice> {
    const invoice = await this.getOwned(tenantId, id);
    if (invoice.status !== InvoiceStatus.DRAFT && invoice.status !== InvoiceStatus.SENT) {
      throw new BadRequestException({
        message: `A ${invoice.status} invoice cannot be sent`,
        error: 'INVOICE_NOT_SENDABLE',
      });
    }
    await this.prisma.invoice.update({
      where: { id },
      data: {
        status: invoice.status === InvoiceStatus.DRAFT ? InvoiceStatus.SENT : invoice.status,
        sentAt: invoice.sentAt ?? new Date(),
        publicToken: invoice.publicToken ?? this.generateToken(),
      },
    });
    await this.addEvent(id, InvoiceEventType.SENT);
    return this.findOne(tenantId, id);
  }

  /** Records a (possibly partial) payment and re-derives the invoice status atomically. */
  async recordPayment(
    tenantId: string,
    userId: string,
    id: string,
    dto: RecordPaymentDto,
  ): Promise<IInvoice> {
    const invoice = await this.getOwned(tenantId, id);
    if (invoice.status === InvoiceStatus.VOID) {
      throw new BadRequestException({
        message: 'Cannot record a payment on a void invoice',
        error: 'INVOICE_VOID',
      });
    }
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException({
        message: 'This invoice is already fully paid',
        error: 'INVOICE_ALREADY_PAID',
      });
    }
    const balance = invoice.totalMinor - invoice.amountPaidMinor;
    if (dto.amountMinor > balance) {
      throw new BadRequestException({
        message: 'Payment exceeds the outstanding balance',
        error: 'PAYMENT_EXCEEDS_BALANCE',
      });
    }
    const newPaid = invoice.amountPaidMinor + dto.amountMinor;
    const fullyPaid = newPaid >= invoice.totalMinor;
    const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          tenantId,
          invoiceId: id,
          amountMinor: dto.amountMinor,
          method: dto.method,
          reference: dto.reference?.trim() || null,
          paidAt,
          note: dto.note?.trim() || null,
          recordedById: userId,
        },
      });
      await tx.invoice.update({
        where: { id },
        data: {
          amountPaidMinor: newPaid,
          status: fullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID,
          // Recording a payment implies the invoice has effectively been issued.
          sentAt: invoice.sentAt ?? paidAt,
          paidAt: fullyPaid ? paidAt : null,
        },
      });
      await tx.invoiceEvent.create({
        data: {
          invoiceId: id,
          type: InvoiceEventType.PAYMENT_RECORDED,
          message: this.paymentMessage(dto),
        },
      });
      if (fullyPaid) {
        await tx.invoiceEvent.create({ data: { invoiceId: id, type: InvoiceEventType.PAID } });
      }
    });
    return this.findOne(tenantId, id);
  }

  async voidInvoice(tenantId: string, id: string): Promise<IInvoice> {
    const invoice = await this.getOwned(tenantId, id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException({
        message: 'A fully paid invoice cannot be voided',
        error: 'INVOICE_PAID',
      });
    }
    if (invoice.status === InvoiceStatus.VOID) {
      return this.findOne(tenantId, id);
    }
    await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.VOID, voidedAt: new Date() },
    });
    await this.addEvent(id, InvoiceEventType.VOIDED);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const invoice = await this.getOwned(tenantId, id);
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException({
        message: 'Only draft invoices can be deleted. Void the invoice instead.',
        error: 'INVOICE_NOT_DELETABLE',
      });
    }
    await this.prisma.invoice.delete({ where: { id } });
  }

  // ---- Public (client-facing, token-based) ----

  async getPublicByToken(token: string): Promise<IPublicInvoice> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { publicToken: token },
      include: {
        client: true,
        tenant: true,
        lineItems: { orderBy: { sortOrder: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });
    if (!invoice || invoice.status === InvoiceStatus.DRAFT) {
      throw new NotFoundException({ message: 'Invoice not found', error: 'INVOICE_NOT_FOUND' });
    }
    if (!invoice.viewedAt) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { viewedAt: new Date() },
      });
      await this.addEvent(invoice.id, InvoiceEventType.VIEWED);
    }
    return this.toPublicDto(invoice);
  }

  // ---- helpers ----

  private computeTotals(dto: CreateInvoiceDto) {
    const lines = dto.lines.map((line, index) => {
      const lineDiscountMinor = line.lineDiscountMinor ?? 0;
      const lineTotalMinor = Math.max(0, line.quantity * line.unitPriceMinor - lineDiscountMinor);
      return {
        catalogItemId: line.catalogItemId ?? null,
        description: line.description.trim(),
        unit: line.unit ?? 'FIXED',
        quantity: line.quantity,
        unitPriceMinor: line.unitPriceMinor,
        lineDiscountMinor,
        lineTotalMinor,
        sortOrder: index,
      };
    });
    const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);
    const discountMinor = Math.min(dto.discountMinor ?? 0, subtotalMinor);
    const taxable = subtotalMinor - discountMinor;
    const taxRatePercent = dto.taxRatePercent ?? 0;
    const taxMinor = Math.round((taxable * taxRatePercent) / 100);
    return {
      lines,
      subtotalMinor,
      discountMinor,
      taxRatePercent,
      taxMinor,
      totalMinor: taxable + taxMinor,
    };
  }

  private async getOwned(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) {
      throw new NotFoundException({ message: 'Invoice not found', error: 'INVOICE_NOT_FOUND' });
    }
    return invoice;
  }

  private async addEvent(
    invoiceId: string,
    type: InvoiceEventType,
    message?: string,
  ): Promise<void> {
    await this.prisma.invoiceEvent.create({ data: { invoiceId, type, message } });
  }

  private generateToken(): string {
    return randomBytes(24).toString('base64url');
  }

  private paymentMessage(dto: RecordPaymentDto): string {
    const amount = (dto.amountMinor / 100).toLocaleString('en-IN');
    const ref = dto.reference?.trim() ? ` · ref ${dto.reference.trim()}` : '';
    return `৳${amount} via ${dto.method}${ref}`;
  }

  private async nextNumber(tx: Prisma.TransactionClient, tenantId: string): Promise<string> {
    const count = await tx.invoice.count({ where: { tenantId } });
    return `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }

  private effectiveTemplate(
    override: string | null,
    tenantDefault: string | null | undefined,
  ): QuoteTemplate {
    return (override ?? tenantDefault ?? DEFAULT_QUOTE_TEMPLATE) as QuoteTemplate;
  }

  private isOverdue(status: InvoiceStatus, dueDate: Date | null): boolean {
    if (status !== InvoiceStatus.SENT && status !== InvoiceStatus.PARTIALLY_PAID) return false;
    return Boolean(dueDate && dueDate.getTime() < Date.now());
  }

  private toDto(
    invoice:
      | InvoiceDetail
      | Prisma.InvoiceGetPayload<{
          include: { client: true; quote: { select: { number: true } } };
        }>,
    withDetail: boolean,
    tenantDefault?: string,
  ): IInvoice {
    const detail = invoice as InvoiceDetail;
    const status = invoice.status as InvoiceStatus;
    const balanceMinor = Math.max(0, invoice.totalMinor - invoice.amountPaidMinor);
    return {
      id: invoice.id,
      tenantId: invoice.tenantId,
      number: invoice.number,
      clientId: invoice.clientId,
      clientName: invoice.client?.name ?? invoice.customerName ?? null,
      quoteId: invoice.quoteId,
      quoteNumber: invoice.quote?.number ?? null,
      status,
      template: this.effectiveTemplate(
        invoice.template,
        tenantDefault ?? detail.tenant?.defaultQuoteTemplate,
      ),
      currency: invoice.currency,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString() ?? null,
      note: invoice.note,
      terms: invoice.terms,
      taxRatePercent: invoice.taxRatePercent,
      discountMinor: invoice.discountMinor,
      subtotalMinor: invoice.subtotalMinor,
      taxMinor: invoice.taxMinor,
      totalMinor: invoice.totalMinor,
      amountPaidMinor: invoice.amountPaidMinor,
      balanceMinor,
      isOverdue: this.isOverdue(status, invoice.dueDate),
      publicToken: invoice.publicToken,
      sentAt: invoice.sentAt?.toISOString() ?? null,
      paidAt: invoice.paidAt?.toISOString() ?? null,
      voidedAt: invoice.voidedAt?.toISOString() ?? null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      ...(withDetail
        ? {
            lineItems: (detail.lineItems ?? []).map((l) => this.lineDto(l)),
            payments: (detail.payments ?? []).map((p) => this.paymentDto(p)),
            events: (detail.events ?? []).map((e) => ({
              id: e.id,
              type: e.type as InvoiceEventType,
              message: e.message,
              actor: e.actor,
              createdAt: e.createdAt.toISOString(),
            })),
          }
        : {}),
    };
  }

  private toPublicDto(
    invoice: Prisma.InvoiceGetPayload<{
      include: { client: true; tenant: true; lineItems: true; payments: true };
    }>,
  ): IPublicInvoice {
    const status = invoice.status as InvoiceStatus;
    return {
      number: invoice.number,
      agencyName: invoice.tenant?.name ?? 'AgencyOS',
      clientName: invoice.client?.name ?? invoice.customerName ?? null,
      status,
      template: this.effectiveTemplate(invoice.template, invoice.tenant?.defaultQuoteTemplate),
      currency: invoice.currency,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString() ?? null,
      note: invoice.note,
      terms: invoice.terms,
      taxRatePercent: invoice.taxRatePercent,
      discountMinor: invoice.discountMinor,
      subtotalMinor: invoice.subtotalMinor,
      taxMinor: invoice.taxMinor,
      totalMinor: invoice.totalMinor,
      amountPaidMinor: invoice.amountPaidMinor,
      balanceMinor: Math.max(0, invoice.totalMinor - invoice.amountPaidMinor),
      isOverdue: this.isOverdue(status, invoice.dueDate),
      lineItems: invoice.lineItems.map((l) => this.lineDto(l)),
      payments: invoice.payments.map((p) => ({
        amountMinor: p.amountMinor,
        method: p.method as PaymentMethod,
        paidAt: p.paidAt.toISOString(),
      })),
    };
  }

  private lineDto(l: {
    id: string;
    catalogItemId: string | null;
    description: string;
    unit: string;
    quantity: number;
    unitPriceMinor: number;
    lineDiscountMinor: number;
    lineTotalMinor: number;
    sortOrder: number;
  }) {
    return {
      id: l.id,
      catalogItemId: l.catalogItemId,
      description: l.description,
      unit: l.unit,
      quantity: l.quantity,
      unitPriceMinor: l.unitPriceMinor,
      lineDiscountMinor: l.lineDiscountMinor,
      lineTotalMinor: l.lineTotalMinor,
      sortOrder: l.sortOrder,
    };
  }

  private paymentDto(p: {
    id: string;
    invoiceId: string;
    amountMinor: number;
    method: string;
    reference: string | null;
    paidAt: Date;
    note: string | null;
    recordedById: string | null;
    recordedBy?: { name: string } | null;
    createdAt: Date;
  }): IPayment {
    return {
      id: p.id,
      invoiceId: p.invoiceId,
      amountMinor: p.amountMinor,
      method: p.method as PaymentMethod,
      reference: p.reference,
      paidAt: p.paidAt.toISOString(),
      note: p.note,
      recordedById: p.recordedById,
      recordedByName: p.recordedBy?.name ?? null,
      createdAt: p.createdAt.toISOString(),
    };
  }
}
