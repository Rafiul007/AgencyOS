import type { IInvoiceLineItem, InvoiceStatus } from '@agencyos/shared';

/** Normalized data the InvoiceDocument renders (works for internal + public shapes). */
export interface IInvoiceDocumentData {
  number: string;
  agencyName: string;
  clientName: string | null;
  status: InvoiceStatus;
  currency: string;
  issueDate: string;
  dueDate: string | null;
  note: string | null;
  terms: string | null;
  taxRatePercent: number;
  discountMinor: number;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  balanceMinor: number;
  isOverdue: boolean;
  lineItems: IInvoiceLineItem[];
}
