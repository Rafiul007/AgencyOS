import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QuoteStatus, QuoteTemplate } from '@agencyos/shared';
import { updateDefaultQuoteTemplate } from '@/features/onboarding/api';
import {
  createQuote,
  deleteQuote,
  fetchQuote,
  fetchQuotes,
  sendQuote,
  updateQuote,
  updateQuoteStatus,
  updateQuoteTemplate,
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

/** Change the template used to render one existing quotation. */
export function useUpdateQuoteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, template }: { id: string; template: QuoteTemplate }) =>
      updateQuoteTemplate(id, template),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: QUOTES_KEY });
      qc.invalidateQueries({ queryKey: ['quotation', id] });
    },
  });
}

/** Set the tenant's active (default) template — persisted so it need not be re-chosen. */
export function useSetDefaultTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (template: QuoteTemplate) => updateDefaultQuoteTemplate(template),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding'] });
      qc.invalidateQueries({ queryKey: QUOTES_KEY });
    },
  });
}
