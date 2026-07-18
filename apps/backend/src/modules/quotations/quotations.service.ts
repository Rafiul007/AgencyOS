import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { Client, Prisma, Quote, QuoteEvent, QuoteLineItem, Tenant } from '@prisma/client';
import { QuoteEventType, QuoteStatus } from '@agencyos/shared';
import type { IPublicQuote, IQuote } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

/** Allowed agency-side status transitions (MVP — pre-payment). */
const TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  [QuoteStatus.DRAFT]: [QuoteStatus.SENT],
  [QuoteStatus.SENT]: [QuoteStatus.ACCEPTED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED],
  [QuoteStatus.ACCEPTED]: [QuoteStatus.CONVERTED],
  [QuoteStatus.REJECTED]: [],
  [QuoteStatus.EXPIRED]: [],
  [QuoteStatus.CONVERTED]: [],
};

type QuoteRecord = Quote & {
  client?: Client | null;
  lineItems?: QuoteLineItem[];
  events?: QuoteEvent[];
  tenant?: Tenant | null;
};

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateQuoteDto): Promise<IQuote> {
    const computed = this.computeTotals(dto);
    const quote = await this.prisma.$transaction(async (tx) => {
      const number = await this.nextNumber(tx, tenantId);
      return tx.quote.create({
        data: {
          tenantId,
          number,
          clientId: dto.clientId ?? null,
          status: QuoteStatus.DRAFT,
          currency: 'BDT',
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
          note: dto.note?.trim(),
          terms: dto.terms?.trim(),
          taxRatePercent: computed.taxRatePercent,
          discountMinor: computed.discountMinor,
          subtotalMinor: computed.subtotalMinor,
          taxMinor: computed.taxMinor,
          totalMinor: computed.totalMinor,
          createdById: userId,
          lineItems: { create: computed.lines },
          events: { create: { type: QuoteEventType.CREATED } },
        },
        include: this.detailInclude(),
      });
    });
    return this.toDto(quote, true);
  }

  /** Edits a DRAFT quote in place (replaces line items and recomputes totals). */
  async update(tenantId: string, id: string, dto: CreateQuoteDto): Promise<IQuote> {
    const existing = await this.getOwned(tenantId, id);
    if (existing.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException({
        message: 'Only draft quotations can be edited',
        error: 'QUOTE_NOT_EDITABLE',
      });
    }
    const computed = this.computeTotals(dto);
    await this.prisma.$transaction(async (tx) => {
      await tx.quoteLineItem.deleteMany({ where: { quoteId: id } });
      await tx.quote.update({
        where: { id },
        data: {
          clientId: dto.clientId ?? null,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
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

  /** Marks a quote as sent and ensures it has a public link for the client. */
  async send(tenantId: string, id: string): Promise<IQuote> {
    const quote = await this.getOwned(tenantId, id);
    if (quote.status !== QuoteStatus.DRAFT && quote.status !== QuoteStatus.SENT) {
      throw new BadRequestException({
        message: `A ${quote.status} quotation cannot be sent`,
        error: 'QUOTE_NOT_SENDABLE',
      });
    }
    await this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.SENT,
        sentAt: quote.sentAt ?? new Date(),
        publicToken: quote.publicToken ?? this.generateToken(),
      },
    });
    await this.addEvent(id, QuoteEventType.SENT);
    return this.findOne(tenantId, id);
  }

  async findAll(tenantId: string): Promise<IQuote[]> {
    const quotes = await this.prisma.quote.findMany({
      where: { tenantId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
    return quotes.map((q) => this.toDto(q, false));
  }

  async findOne(tenantId: string, id: string): Promise<IQuote> {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
      include: this.detailInclude(),
    });
    if (!quote) {
      throw new NotFoundException({ message: 'Quotation not found', error: 'QUOTE_NOT_FOUND' });
    }
    return this.toDto(quote, true);
  }

  async updateStatus(tenantId: string, id: string, next: QuoteStatus): Promise<IQuote> {
    const current = await this.getOwned(tenantId, id);
    const allowed = TRANSITIONS[current.status as QuoteStatus] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        message: `Cannot move a ${current.status} quotation to ${next}`,
        error: 'INVALID_STATUS_TRANSITION',
      });
    }
    await this.prisma.quote.update({ where: { id }, data: { status: next } });
    const eventType = this.statusEvent(next);
    if (eventType) {
      await this.addEvent(id, eventType);
    }
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.getOwned(tenantId, id);
    await this.prisma.quote.delete({ where: { id } });
  }

  // ---- Public (client-facing, token-based) ----

  async getPublicByToken(token: string): Promise<IPublicQuote> {
    const quote = await this.findByToken(token);
    if (!quote.viewedAt) {
      await this.prisma.quote.update({ where: { id: quote.id }, data: { viewedAt: new Date() } });
      await this.addEvent(quote.id, QuoteEventType.VIEWED);
    }
    return this.toPublicDto(quote);
  }

  async approvePublic(token: string, signerName: string, ip: string): Promise<IPublicQuote> {
    const quote = await this.findByToken(token);
    this.assertRespondable(quote);
    await this.prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: QuoteStatus.ACCEPTED,
        signerName: signerName.trim(),
        approvalIp: ip,
        respondedAt: new Date(),
      },
    });
    await this.addEvent(quote.id, QuoteEventType.APPROVED, signerName.trim());
    return this.toPublicDto(await this.findByToken(token));
  }

  async rejectPublic(token: string, reason: string | undefined, ip: string): Promise<IPublicQuote> {
    const quote = await this.findByToken(token);
    this.assertRespondable(quote);
    await this.prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: QuoteStatus.REJECTED,
        rejectionReason: reason?.trim() ?? null,
        approvalIp: ip,
        respondedAt: new Date(),
      },
    });
    await this.addEvent(quote.id, QuoteEventType.REJECTED, undefined, reason?.trim());
    return this.toPublicDto(await this.findByToken(token));
  }

  // ---- helpers ----

  private assertRespondable(quote: QuoteRecord): void {
    if (quote.status !== QuoteStatus.SENT) {
      throw new BadRequestException({
        message: 'This quotation has already been responded to',
        error: 'QUOTE_ALREADY_RESPONDED',
      });
    }
    if (quote.expiresAt && quote.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException({
        message: 'This quotation has expired',
        error: 'QUOTE_EXPIRED',
      });
    }
  }

  private async findByToken(token: string): Promise<QuoteRecord> {
    const quote = await this.prisma.quote.findUnique({
      where: { publicToken: token },
      include: { client: true, tenant: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!quote || quote.status === QuoteStatus.DRAFT) {
      throw new NotFoundException({ message: 'Quotation not found', error: 'QUOTE_NOT_FOUND' });
    }
    return quote;
  }

  private computeTotals(dto: CreateQuoteDto) {
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

  private async getOwned(tenantId: string, id: string): Promise<Quote> {
    const quote = await this.prisma.quote.findFirst({ where: { id, tenantId } });
    if (!quote) {
      throw new NotFoundException({ message: 'Quotation not found', error: 'QUOTE_NOT_FOUND' });
    }
    return quote;
  }

  private detailInclude() {
    return {
      client: true,
      lineItems: { orderBy: { sortOrder: 'asc' as const } },
      events: { orderBy: { createdAt: 'desc' as const } },
    };
  }

  private async addEvent(
    quoteId: string,
    type: QuoteEventType,
    actor?: string,
    message?: string,
  ): Promise<void> {
    await this.prisma.quoteEvent.create({ data: { quoteId, type, actor, message } });
  }

  private statusEvent(next: QuoteStatus): QuoteEventType | null {
    const map: Partial<Record<QuoteStatus, QuoteEventType>> = {
      [QuoteStatus.SENT]: QuoteEventType.SENT,
      [QuoteStatus.ACCEPTED]: QuoteEventType.APPROVED,
      [QuoteStatus.REJECTED]: QuoteEventType.REJECTED,
      [QuoteStatus.CONVERTED]: QuoteEventType.CONVERTED,
    };
    return map[next] ?? null;
  }

  private generateToken(): string {
    return randomBytes(24).toString('base64url');
  }

  private async nextNumber(tx: Prisma.TransactionClient, tenantId: string): Promise<string> {
    const count = await tx.quote.count({ where: { tenantId } });
    return `AOS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }

  private toDto(quote: QuoteRecord, withDetail: boolean): IQuote {
    return {
      id: quote.id,
      tenantId: quote.tenantId,
      number: quote.number,
      clientId: quote.clientId,
      clientName: quote.client?.name ?? null,
      status: quote.status as IQuote['status'],
      currency: quote.currency,
      issueDate: quote.issueDate.toISOString(),
      expiresAt: quote.expiresAt ? quote.expiresAt.toISOString() : null,
      note: quote.note,
      terms: quote.terms,
      taxRatePercent: quote.taxRatePercent,
      discountMinor: quote.discountMinor,
      subtotalMinor: quote.subtotalMinor,
      taxMinor: quote.taxMinor,
      totalMinor: quote.totalMinor,
      publicToken: quote.publicToken,
      sentAt: quote.sentAt ? quote.sentAt.toISOString() : null,
      viewedAt: quote.viewedAt ? quote.viewedAt.toISOString() : null,
      respondedAt: quote.respondedAt ? quote.respondedAt.toISOString() : null,
      signerName: quote.signerName,
      rejectionReason: quote.rejectionReason,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
      ...(withDetail
        ? {
            lineItems: (quote.lineItems ?? []).map((l) => this.lineDto(l)),
            events: (quote.events ?? []).map((e) => ({
              id: e.id,
              type: e.type as QuoteEventType,
              message: e.message,
              actor: e.actor,
              createdAt: e.createdAt.toISOString(),
            })),
          }
        : {}),
    };
  }

  private toPublicDto(quote: QuoteRecord): IPublicQuote {
    return {
      number: quote.number,
      agencyName: quote.tenant?.name ?? 'AgencyOS',
      clientName: quote.client?.name ?? null,
      status: quote.status as IPublicQuote['status'],
      currency: quote.currency,
      issueDate: quote.issueDate.toISOString(),
      expiresAt: quote.expiresAt ? quote.expiresAt.toISOString() : null,
      note: quote.note,
      terms: quote.terms,
      taxRatePercent: quote.taxRatePercent,
      discountMinor: quote.discountMinor,
      subtotalMinor: quote.subtotalMinor,
      taxMinor: quote.taxMinor,
      totalMinor: quote.totalMinor,
      signerName: quote.signerName,
      respondedAt: quote.respondedAt ? quote.respondedAt.toISOString() : null,
      lineItems: (quote.lineItems ?? []).map((l) => this.lineDto(l)),
    };
  }

  private lineDto(l: QuoteLineItem) {
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
}
