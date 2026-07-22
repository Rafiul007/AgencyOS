import { apiClient } from '@/lib/apiClient';
import type { IAuthUser, ITeamMember, UserRole } from '@agencyos/shared';

export interface ICreateMemberInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUpdateMemberInput {
  role?: UserRole;
  isActive?: boolean;
}

export async function fetchTeam(): Promise<ITeamMember[]> {
  const { data } = await apiClient.get<ITeamMember[]>('/users');
  return data;
}

export async function createMember(input: ICreateMemberInput): Promise<IAuthUser> {
  const { data } = await apiClient.post<IAuthUser>('/users', input);
  return data;
}

export async function updateMember(id: string, input: IUpdateMemberInput): Promise<ITeamMember> {
  const { data } = await apiClient.patch<ITeamMember>(`/users/${id}`, input);
  return data;
}

export async function removeMember(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
