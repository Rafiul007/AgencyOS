import { apiClient } from '@/lib/apiClient';
import type { IPublicQuote, IQuote, QuoteStatus, QuoteTemplate } from '@agencyos/shared';

export interface IQuoteLineInput {
  catalogItemId?: string | null;
  description: string;
  unit?: string;
  quantity: number;
  unitPriceMinor: number;
  lineDiscountMinor?: number;
}

export interface ICreateQuoteInput {
  clientId?: string;
  customerName?: string;
  expiresAt?: string;
  note?: string;
  terms?: string;
  taxRatePercent?: number;
  discountMinor?: number;
  lines: IQuoteLineInput[];
}

export async function fetchQuotes(): Promise<IQuote[]> {
  const { data } = await apiClient.get<IQuote[]>('/quotations');
  return data;
}

export async function fetchQuote(id: string): Promise<IQuote> {
  const { data } = await apiClient.get<IQuote>(`/quotations/${id}`);
  return data;
}

export async function createQuote(input: ICreateQuoteInput): Promise<IQuote> {
  const { data } = await apiClient.post<IQuote>('/quotations', input);
  return data;
}

export async function updateQuote(id: string, input: ICreateQuoteInput): Promise<IQuote> {
  const { data } = await apiClient.patch<IQuote>(`/quotations/${id}`, input);
  return data;
}

export async function sendQuote(id: string): Promise<IQuote> {
  const { data } = await apiClient.post<IQuote>(`/quotations/${id}/send`, {});
  return data;
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<IQuote> {
  const { data } = await apiClient.patch<IQuote>(`/quotations/${id}/status`, { status });
  return data;
}

export async function updateQuoteTemplate(id: string, template: QuoteTemplate): Promise<IQuote> {
  const { data } = await apiClient.patch<IQuote>(`/quotations/${id}/template`, { template });
  return data;
}

export async function deleteQuote(id: string): Promise<void> {
  await apiClient.delete(`/quotations/${id}`);
}

// ---- Public (client-facing, token-based) ----

export async function fetchPublicQuote(token: string): Promise<IPublicQuote> {
  const { data } = await apiClient.get<IPublicQuote>(`/public/quotations/${token}`);
  return data;
}

export async function approvePublicQuote(token: string, signerName: string): Promise<IPublicQuote> {
  const { data } = await apiClient.post<IPublicQuote>(`/public/quotations/${token}/approve`, {
    signerName,
  });
  return data;
}

export async function rejectPublicQuote(token: string, reason: string): Promise<IPublicQuote> {
  const { data } = await apiClient.post<IPublicQuote>(`/public/quotations/${token}/reject`, {
    reason,
  });
  return data;
}
