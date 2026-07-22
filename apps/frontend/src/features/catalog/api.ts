import { apiClient } from '@/lib/apiClient';
import type { CatalogItemType, ICatalogItem, PricingUnit } from '@agencyos/shared';

export interface ICatalogItemInput {
  type: CatalogItemType;
  name: string;
  description?: string;
  category?: string;
  pricingUnit: PricingUnit;
  priceMinor: number;
  currency?: string;
}

export async function fetchCatalogItems(): Promise<ICatalogItem[]> {
  const { data } = await apiClient.get<ICatalogItem[]>('/catalog/items');
  return data;
}

export async function createCatalogItem(input: ICatalogItemInput): Promise<ICatalogItem> {
  const { data } = await apiClient.post<ICatalogItem>('/catalog/items', input);
  return data;
}

export async function updateCatalogItem(
  id: string,
  input: Partial<ICatalogItemInput> & { isActive?: boolean },
): Promise<ICatalogItem> {
  const { data } = await apiClient.patch<ICatalogItem>(`/catalog/items/${id}`, input);
  return data;
}

export async function deleteCatalogItem(id: string): Promise<void> {
  await apiClient.delete(`/catalog/items/${id}`);
}
