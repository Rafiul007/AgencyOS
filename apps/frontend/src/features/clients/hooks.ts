import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, deleteClient, fetchClients, updateClient, type IClientInput } from './api';

const CLIENTS_KEY = ['clients'];

export function useClients() {
  return useQuery({ queryKey: CLIENTS_KEY, queryFn: fetchClients });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<IClientInput> }) =>
      updateClient(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  });
}
