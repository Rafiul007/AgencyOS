import type { IQuoteLineItem, QuoteStatus, QuoteTemplate } from '@agencyos/shared';

/** How a template renders its header band. Each variant is a distinct visual layout. */
export type QuoteHeaderVariant = 'bar' | 'gradient' | 'plain' | 'block' | 'banner';

/**
 * Visual style tokens for one quotation template. Adding a template means adding a
 * style entry — the renderer never needs to change (open/closed).
 */
export interface IQuoteTemplateStyle {
  key: QuoteTemplate;
  fontFamily: string;
  headerVariant: QuoteHeaderVariant;
  /** Brand accent used for emphasis (title, total, links). */
  accent: string;
  /** Readable text color on top of accent / header surfaces. */
  onAccent: string;
  /** Header background — may be a solid color or a CSS gradient. */
  headerBg: string;
  ink: string;
  inkSoft: string;
  surface: string;
  panel: string;
  border: string;
  tableHeadBg: string;
  tableHeadText: string;
  stripedRows: boolean;
  radius: number;
  titleUpper: boolean;
  titleWeight: number;
}

/**
 * The normalized data a template renders. Both IQuote (internal) and IPublicQuote
 * (client-facing) adapt to this shape, so one renderer serves every surface (DRY).
 */
export interface IQuoteDocumentData {
  number: string;
  agencyName: string;
  clientName: string | null;
  status: QuoteStatus;
  currency: string;
  issueDate: string;
  expiresAt: string | null;
  note: string | null;
  terms: string | null;
  taxRatePercent: number;
  discountMinor: number;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  signerName: string | null;
  respondedAt: string | null;
  lineItems: IQuoteLineItem[];
}
