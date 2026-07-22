import { apiClient } from '@/lib/apiClient';
import type { ISubscription } from '@agencyos/shared';

export async function fetchSubscription(): Promise<ISubscription | null> {
  const { data } = await apiClient.get<ISubscription | null>('/subscription');
  return data;
}
