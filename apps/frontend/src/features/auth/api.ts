import { apiClient } from '@/lib/apiClient';
import { tokenStorage } from '@/lib/tokenStorage';
import type { IAuthResponse, IAuthUser } from '@agencyos/shared';

export interface IRegisterInput {
  companyName: string;
  name: string;
  email: string;
  password: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export async function registerRequest(input: IRegisterInput): Promise<IAuthUser> {
  const { data } = await apiClient.post<IAuthResponse>('/auth/register', input);
  tokenStorage.set(data.tokens);
  return data.user;
}

export async function loginRequest(input: ILoginInput): Promise<IAuthUser> {
  const { data } = await apiClient.post<IAuthResponse>('/auth/login', input);
  tokenStorage.set(data.tokens);
  return data.user;
}

export async function fetchCurrentUser(): Promise<IAuthUser> {
  const { data } = await apiClient.get<IAuthUser>('/auth/me');
  return data;
}

export async function logoutRequest(): Promise<void> {
  const refreshToken = tokenStorage.refresh;
  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore — clearing local tokens is enough for the client.
    }
  }
  tokenStorage.clear();
}
