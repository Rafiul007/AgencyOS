import { apiClient } from '@/lib/apiClient';
import type { IQuote, QuoteStatus } from '@agencyos/shared';

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

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<IQuote> {
  const { data } = await apiClient.patch<IQuote>(`/quotations/${id}/status`, { status });
  return data;
}

export async function deleteQuote(id: string): Promise<void> {
  await apiClient.delete(`/quotations/${id}`);
}
