import type { IPublicQuote, IQuote } from '@agencyos/shared';
import type { IQuoteDocumentData } from './interface';

/** Adapt an internal quote (+ the tenant's agency name) to the shared document shape. */
export function quoteToDocument(quote: IQuote, agencyName: string): IQuoteDocumentData {
  return {
    number: quote.number,
    agencyName,
    clientName: quote.clientName,
    status: quote.status,
    currency: quote.currency,
    issueDate: quote.issueDate,
    expiresAt: quote.expiresAt,
    note: quote.note,
    terms: quote.terms,
    taxRatePercent: quote.taxRatePercent,
    discountMinor: quote.discountMinor,
    subtotalMinor: quote.subtotalMinor,
    taxMinor: quote.taxMinor,
    totalMinor: quote.totalMinor,
    signerName: quote.signerName,
    respondedAt: quote.respondedAt,
    lineItems: quote.lineItems ?? [],
  };
}

/** Adapt a client-facing public quote to the shared document shape. */
export function publicQuoteToDocument(quote: IPublicQuote): IQuoteDocumentData {
  return {
    number: quote.number,
    agencyName: quote.agencyName,
    clientName: quote.clientName,
    status: quote.status,
    currency: quote.currency,
    issueDate: quote.issueDate,
    expiresAt: quote.expiresAt,
    note: quote.note,
    terms: quote.terms,
    taxRatePercent: quote.taxRatePercent,
    discountMinor: quote.discountMinor,
    subtotalMinor: quote.subtotalMinor,
    taxMinor: quote.taxMinor,
    totalMinor: quote.totalMinor,
    signerName: quote.signerName,
    respondedAt: quote.respondedAt,
    lineItems: quote.lineItems,
  };
}
