import { apiClient } from '@/lib/apiClient';
import type { IInvoice, IPublicInvoice, PaymentMethod, QuoteTemplate } from '@agencyos/shared';

export interface IInvoiceLineInput {
  catalogItemId?: string | null;
  description: string;
  unit?: string;
  quantity: number;
  unitPriceMinor: number;
  lineDiscountMinor?: number;
}

export interface ICreateInvoiceInput {
  clientId?: string;
  customerName?: string;
  issueDate?: string;
  dueDate?: string;
  note?: string;
  terms?: string;
  taxRatePercent?: number;
  discountMinor?: number;
  lines: IInvoiceLineInput[];
}

export interface IRecordPaymentInput {
  amountMinor: number;
  method: PaymentMethod;
  reference?: string;
  paidAt?: string;
  note?: string;
}

export async function fetchInvoices(): Promise<IInvoice[]> {
  const { data } = await apiClient.get<IInvoice[]>('/invoices');
  return data;
}

export async function fetchInvoice(id: string): Promise<IInvoice> {
  const { data } = await apiClient.get<IInvoice>(`/invoices/${id}`);
  return data;
}

export async function createInvoice(input: ICreateInvoiceInput): Promise<IInvoice> {
  const { data } = await apiClient.post<IInvoice>('/invoices', input);
  return data;
}

export async function createInvoiceFromQuote(quoteId: string): Promise<IInvoice> {
  const { data } = await apiClient.post<IInvoice>(`/invoices/from-quote/${quoteId}`, {});
  return data;
}

export async function updateInvoice(id: string, input: ICreateInvoiceInput): Promise<IInvoice> {
  const { data } = await apiClient.patch<IInvoice>(`/invoices/${id}`, input);
  return data;
}

export async function updateInvoiceTemplate(
  id: string,
  template: QuoteTemplate,
): Promise<IInvoice> {
  const { data } = await apiClient.patch<IInvoice>(`/invoices/${id}/template`, { template });
  return data;
}

export async function sendInvoice(id: string): Promise<IInvoice> {
  const { data } = await apiClient.post<IInvoice>(`/invoices/${id}/send`, {});
  return data;
}

export async function recordPayment(id: string, input: IRecordPaymentInput): Promise<IInvoice> {
  const { data } = await apiClient.post<IInvoice>(`/invoices/${id}/payments`, input);
  return data;
}

export async function voidInvoice(id: string): Promise<IInvoice> {
  const { data } = await apiClient.post<IInvoice>(`/invoices/${id}/void`, {});
  return data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await apiClient.delete(`/invoices/${id}`);
}

export async function fetchPublicInvoice(token: string): Promise<IPublicInvoice> {
  const { data } = await apiClient.get<IPublicInvoice>(`/public/invoices/${token}`);
  return data;
}
