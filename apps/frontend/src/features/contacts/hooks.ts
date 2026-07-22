import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ContactStage } from '@agencyos/shared';
import {
  convertContact,
  createContact,
  deleteContact,
  fetchContact,
  fetchContacts,
  fetchTenantUsers,
  importContacts,
  logContactActivity,
  moveContactStage,
  updateContact,
  type IActivityInput,
  type IContactFilters,
  type IContactInput,
} from './api';

const CONTACTS_KEY = ['contacts'];

export function useContacts(filters: IContactFilters = {}) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, filters],
    queryFn: () => fetchContacts(filters),
  });
}

export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => fetchContact(id as string),
    enabled: Boolean(id),
  });
}

export function useTenantUsers() {
  return useQuery({ queryKey: ['tenant-users'], queryFn: fetchTenantUsers });
}

function useInvalidate() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: CONTACTS_KEY });
    if (id) qc.invalidateQueries({ queryKey: ['contact', id] });
  };
}

export function useCreateContact() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: createContact, onSuccess: () => invalidate() });
}

export function useUpdateContact() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<IContactInput> }) =>
      updateContact(id, input),
    onSuccess: (_d, { id }) => invalidate(id),
  });
}

export function useDeleteContact() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: deleteContact, onSuccess: () => invalidate() });
}

export function useMoveStage() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: ContactStage }) => moveContactStage(id, stage),
    onSuccess: (_d, { id }) => invalidate(id),
  });
}

export function useLogActivity() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: IActivityInput }) =>
      logContactActivity(id, input),
    onSuccess: (_d, { id }) => invalidate(id),
  });
}

export function useConvertContact() {
  const invalidate = useInvalidate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: convertContact,
    onSuccess: (_d, id) => {
      invalidate(id);
      qc.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useImportContacts() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: importContacts, onSuccess: () => invalidate() });
}
