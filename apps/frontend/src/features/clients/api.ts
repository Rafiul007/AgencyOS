import { apiClient } from '@/lib/apiClient';
import type { ClientStatus, IClient } from '@agencyos/shared';

export interface IClientInput {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: ClientStatus;
}

export async function fetchClients(): Promise<IClient[]> {
  const { data } = await apiClient.get<IClient[]>('/clients');
  return data;
}

export async function createClient(input: IClientInput): Promise<IClient> {
  const { data } = await apiClient.post<IClient>('/clients', input);
  return data;
}

export async function updateClient(id: string, input: Partial<IClientInput>): Promise<IClient> {
  const { data } = await apiClient.patch<IClient>(`/clients/${id}`, input);
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  await apiClient.delete(`/clients/${id}`);
}
