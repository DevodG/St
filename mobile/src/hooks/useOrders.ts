import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelOrder, getOrderEvents, listOrders, submitOrder, type OrderStatus, type SubmitOrderInput } from '../services/orders';

export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ['orders', status ?? 'ALL'],
    queryFn: () => listOrders(status),
    staleTime: 15_000,
  });
}

export function useOrderEvents(orderId: string | null) {
  return useQuery({
    queryKey: ['order-events', orderId],
    queryFn: () => getOrderEvents(String(orderId)),
    enabled: Boolean(orderId),
    staleTime: 10_000,
  });
}

export function useSubmitOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitOrderInput) => submitOrder(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
        queryClient.invalidateQueries({ queryKey: ['portfolio-history'] }),
        queryClient.invalidateQueries({ queryKey: ['trades'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: async (_order, orderId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['order-events', orderId] }),
        queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
      ]);
    },
  });
}
