import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitOrder } from '../services/orders';

export interface TradeInput {
  symbol: string;
  type: 'BUY' | 'SELL';
  sharesFloat?: number;
  amountCents?: number;
  orderType: 'market' | 'limit';
  limitPriceCents?: number;
}

export function useTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitOrder,
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
