import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/services/api';
import { apiProductToProduct, apiCategoryToCategory } from '@/types';

export function useProducts(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const data = await productsApi.getAll(params);
      return data.map(apiProductToProduct);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const data = await productsApi.getById(id);
      return apiProductToProduct(data);
    },
    enabled: !!id,
  });
}

export function useBestSellers() {
  return useQuery({
    queryKey: ['products', 'best-sellers'],
    queryFn: async () => {
      const data = await productsApi.getBestSellers();
      return data.map(apiProductToProduct);
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await categoriesApi.getAll();
      return data.map(apiCategoryToCategory);
    },
  });
}
