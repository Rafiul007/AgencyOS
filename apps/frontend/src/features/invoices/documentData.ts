import type { IInvoice, IPublicInvoice } from '@agencyos/shared';
import type { IInvoiceDocumentData } from './interface';

export function invoiceToDocument(invoice: IInvoice, agencyName: string): IInvoiceDocumentData {
  return {
    number: invoice.number,
    agencyName,
    clientName: invoice.clientName,
    status: invoice.status,
    currency: invoice.currency,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    note: invoice.note,
    terms: invoice.terms,
    taxRatePercent: invoice.taxRatePercent,
    discountMinor: invoice.discountMinor,
    subtotalMinor: invoice.subtotalMinor,
    taxMinor: invoice.taxMinor,
    totalMinor: invoice.totalMinor,
    amountPaidMinor: invoice.amountPaidMinor,
    balanceMinor: invoice.balanceMinor,
    isOverdue: invoice.isOverdue,
    lineItems: invoice.lineItems ?? [],
  };
}

export function publicInvoiceToDocument(invoice: IPublicInvoice): IInvoiceDocumentData {
  return {
    number: invoice.number,
    agencyName: invoice.agencyName,
    clientName: invoice.clientName,
    status: invoice.status,
    currency: invoice.currency,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    note: invoice.note,
    terms: invoice.terms,
    taxRatePercent: invoice.taxRatePercent,
    discountMinor: invoice.discountMinor,
    subtotalMinor: invoice.subtotalMinor,
    taxMinor: invoice.taxMinor,
    totalMinor: invoice.totalMinor,
    amountPaidMinor: invoice.amountPaidMinor,
    balanceMinor: invoice.balanceMinor,
    isOverdue: invoice.isOverdue,
    lineItems: invoice.lineItems,
  };
}
