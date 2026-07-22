import { apiClient } from '@/lib/apiClient';
import type {
  ContactActivityOutcome,
  ContactActivityType,
  ContactStage,
  IAuthUser,
  IContact,
} from '@agencyos/shared';

export interface IContactInput {
  name: string;
  company?: string;
  email?: string;
  mobile?: string;
  whatsapp?: string;
  source?: string;
  stage?: ContactStage;
  tags?: string[];
  notes?: string;
  assignedToId?: string;
  nextFollowUpAt?: string;
}

export interface IContactFilters {
  search?: string;
  assignedToId?: string;
  tag?: string;
  followUpDue?: boolean;
}

export interface IActivityInput {
  type: ContactActivityType;
  outcome?: ContactActivityOutcome;
  note?: string;
  occurredAt?: string;
  nextFollowUpAt?: string;
}

export async function fetchContacts(filters: IContactFilters = {}): Promise<IContact[]> {
  const { data } = await apiClient.get<IContact[]>('/contacts', {
    params: {
      search: filters.search || undefined,
      assignedToId: filters.assignedToId || undefined,
      tag: filters.tag || undefined,
      followUpDue: filters.followUpDue ? 'true' : undefined,
    },
  });
  return data;
}

export async function fetchContact(id: string): Promise<IContact> {
  const { data } = await apiClient.get<IContact>(`/contacts/${id}`);
  return data;
}

export async function createContact(input: IContactInput): Promise<IContact> {
  const { data } = await apiClient.post<IContact>('/contacts', input);
  return data;
}

export async function updateContact(id: string, input: Partial<IContactInput>): Promise<IContact> {
  const { data } = await apiClient.patch<IContact>(`/contacts/${id}`, input);
  return data;
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(`/contacts/${id}`);
}

export async function moveContactStage(id: string, stage: ContactStage): Promise<IContact> {
  const { data } = await apiClient.patch<IContact>(`/contacts/${id}/stage`, { stage });
  return data;
}

export async function logContactActivity(id: string, input: IActivityInput): Promise<IContact> {
  const { data } = await apiClient.post<IContact>(`/contacts/${id}/activities`, input);
  return data;
}

export async function convertContact(id: string): Promise<IContact> {
  const { data } = await apiClient.post<IContact>(`/contacts/${id}/convert`, {});
  return data;
}

export async function importContacts(contacts: IContactInput[]): Promise<{ created: number }> {
  const { data } = await apiClient.post<{ created: number }>('/contacts/import', { contacts });
  return data;
}

export async function fetchTenantUsers(): Promise<IAuthUser[]> {
  const { data } = await apiClient.get<IAuthUser[]>('/users');
  return data;
}
