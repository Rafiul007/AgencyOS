import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCatalogItem,
  deleteCatalogItem,
  fetchCatalogItems,
  updateCatalogItem,
  type ICatalogItemInput,
} from './api';

const CATALOG_KEY = ['catalog-items'];

export function useCatalogItems() {
  return useQuery({ queryKey: CATALOG_KEY, queryFn: fetchCatalogItems });
}

export function useCreateCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCatalogItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  });
}

export function useUpdateCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ICatalogItemInput> }) =>
      updateCatalogItem(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  });
}

export function useDeleteCatalogItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCatalogItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  });
}
