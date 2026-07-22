import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QuoteTemplate } from '@agencyos/shared';
import {
  createInvoice,
  createInvoiceFromQuote,
  deleteInvoice,
  fetchInvoice,
  fetchInvoices,
  recordPayment,
  sendInvoice,
  updateInvoice,
  updateInvoiceTemplate,
  voidInvoice,
  type ICreateInvoiceInput,
  type IRecordPaymentInput,
} from './api';

const INVOICES_KEY = ['invoices'];

export function useInvoices() {
  return useQuery({ queryKey: INVOICES_KEY, queryFn: fetchInvoices });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: INVOICES_KEY });
    if (id) qc.invalidateQueries({ queryKey: ['invoice', id] });
  };
}

export function useCreateInvoice() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: createInvoice, onSuccess: () => invalidate() });
}

export function useCreateInvoiceFromQuote() {
  const invalidate = useInvalidate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInvoiceFromQuote,
    onSuccess: (_d, quoteId) => {
      invalidate();
      qc.invalidateQueries({ queryKey: ['quotations'] });
      qc.invalidateQueries({ queryKey: ['quotation', quoteId] });
    },
  });
}

export function useUpdateInvoice() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ICreateInvoiceInput }) =>
      updateInvoice(id, input),
    onSuccess: (_d, { id }) => invalidate(id),
  });
}

export function useUpdateInvoiceTemplate() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, template }: { id: string; template: QuoteTemplate }) =>
      updateInvoiceTemplate(id, template),
    onSuccess: (_d, { id }) => invalidate(id),
  });
}

export function useSendInvoice() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: sendInvoice, onSuccess: (_d, id) => invalidate(id) });
}

export function useRecordPayment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: IRecordPaymentInput }) =>
      recordPayment(id, input),
    onSuccess: (_d, { id }) => invalidate(id),
  });
}

export function useVoidInvoice() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: voidInvoice, onSuccess: (_d, id) => invalidate(id) });
}

export function useDeleteInvoice() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: deleteInvoice, onSuccess: () => invalidate() });
}
