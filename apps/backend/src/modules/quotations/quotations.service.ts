import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Client, Prisma, Quote, QuoteLineItem } from '@prisma/client';
import { QuoteStatus } from '@agencyos/shared';
import type { IQuote } from '@agencyos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

type QuoteRecord = Quote & { client?: Client | null; lineItems?: QuoteLineItem[] };

/** Allowed status transitions (agency-side, MVP — pre-payment). */
const TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  [QuoteStatus.DRAFT]: [QuoteStatus.SENT],
  [QuoteStatus.SENT]: [QuoteStatus.ACCEPTED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED],
  [QuoteStatus.ACCEPTED]: [QuoteStatus.CONVERTED],
  [QuoteStatus.REJECTED]: [],
  [QuoteStatus.EXPIRED]: [],
  [QuoteStatus.CONVERTED]: [],
};

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateQuoteDto): Promise<IQuote> {
    const lines = dto.lines.map((line, index) => {
      const quantity = line.quantity;
      const lineDiscountMinor = line.lineDiscountMinor ?? 0;
      const lineTotalMinor = Math.max(0, quantity * line.unitPriceMinor - lineDiscountMinor);
      return {
        catalogItemId: line.catalogItemId ?? null,
        description: line.description.trim(),
        unit: line.unit ?? 'FIXED',
        quantity,
        unitPriceMinor: line.unitPriceMinor,
        lineDiscountMinor,
        lineTotalMinor,
        sortOrder: index,
      };
    });

    // Totals are computed server-side; client-supplied totals are never trusted.
    const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);
    const discountMinor = Math.min(dto.discountMinor ?? 0, subtotalMinor);
    const taxable = subtotalMinor - discountMinor;
    const taxRatePercent = dto.taxRatePercent ?? 0;
    const taxMinor = Math.round((taxable * taxRatePercent) / 100);
    const totalMinor = taxable + taxMinor;

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
          taxRatePercent,
          discountMinor,
          subtotalMinor,
          taxMinor,
          totalMinor,
          createdById: userId,
          lineItems: { create: lines },
        },
        include: { client: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
      });
    });

    return this.toDto(quote, true);
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
      include: { client: true, lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!quote) {
      throw new NotFoundException({ message: 'Quotation not found', error: 'QUOTE_NOT_FOUND' });
    }
    return this.toDto(quote, true);
  }

  async updateStatus(tenantId: string, id: string, next: QuoteStatus): Promise<IQuote> {
    const current = await this.prisma.quote.findFirst({ where: { id, tenantId } });
    if (!current) {
      throw new NotFoundException({ message: 'Quotation not found', error: 'QUOTE_NOT_FOUND' });
    }
    const allowed = TRANSITIONS[current.status as QuoteStatus] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        message: `Cannot move a ${current.status} quotation to ${next}`,
        error: 'INVALID_STATUS_TRANSITION',
      });
    }
    await this.prisma.quote.update({ where: { id }, data: { status: next } });
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const quote = await this.prisma.quote.findFirst({ where: { id, tenantId } });
    if (!quote) {
      throw new NotFoundException({ message: 'Quotation not found', error: 'QUOTE_NOT_FOUND' });
    }
    await this.prisma.quote.delete({ where: { id } });
  }

  /** Allocates the next per-tenant quote number inside the surrounding transaction. */
  private async nextNumber(tx: Prisma.TransactionClient, tenantId: string): Promise<string> {
    const count = await tx.quote.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    return `AOS-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private toDto(quote: QuoteRecord, withLines: boolean): IQuote {
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
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
      ...(withLines
        ? {
            lineItems: (quote.lineItems ?? []).map((l) => ({
              id: l.id,
              catalogItemId: l.catalogItemId,
              description: l.description,
              unit: l.unit,
              quantity: l.quantity,
              unitPriceMinor: l.unitPriceMinor,
              lineDiscountMinor: l.lineDiscountMinor,
              lineTotalMinor: l.lineTotalMinor,
              sortOrder: l.sortOrder,
            })),
          }
        : {}),
    };
  }
}
