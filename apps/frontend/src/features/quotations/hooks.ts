import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QuoteStatus } from '@agencyos/shared';
import {
  createQuote,
  deleteQuote,
  fetchQuote,
  fetchQuotes,
  sendQuote,
  updateQuote,
  updateQuoteStatus,
  type ICreateQuoteInput,
} from './api';

const QUOTES_KEY = ['quotations'];

export function useQuotes() {
  return useQuery({ queryKey: QUOTES_KEY, queryFn: fetchQuotes });
}

export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: () => fetchQuote(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUOTES_KEY }),
  });
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) =>
      updateQuoteStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: QUOTES_KEY });
      qc.invalidateQueries({ queryKey: ['quotation', id] });
    },
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUOTES_KEY }),
  });
}

export function useSendQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendQuote,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: QUOTES_KEY });
      qc.invalidateQueries({ queryKey: ['quotation', id] });
    },
  });
}

export function useUpdateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ICreateQuoteInput }) => updateQuote(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: QUOTES_KEY });
      qc.invalidateQueries({ queryKey: ['quotation', id] });
    },
  });
}
