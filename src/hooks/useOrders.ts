import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, dashboardApi } from '@/services/api';
import { apiOrderToOrder } from '@/types';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const data = await ordersApi.getAll();
      return data.map(apiOrderToOrder);
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: () => ordersApi.getAllAdmin(),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethod?: string) => ordersApi.create(paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
  });
}
