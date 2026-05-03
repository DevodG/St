import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTradeJournal, listTradeJournals, saveTradeJournal, type TradeJournalInput } from '../services/journals';

export function useTradeJournals() {
  return useQuery({
    queryKey: ['trade-journals'],
    queryFn: listTradeJournals,
    staleTime: 30_000,
  });
}

export function useTradeJournal(tradeId: string | null) {
  return useQuery({
    queryKey: ['trade-journal', tradeId],
    queryFn: () => getTradeJournal(String(tradeId)),
    enabled: Boolean(tradeId),
    staleTime: 30_000,
  });
}

export function useSaveTradeJournal(tradeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TradeJournalInput) => saveTradeJournal(tradeId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trade-journals'] }),
        queryClient.invalidateQueries({ queryKey: ['trade-journal', tradeId] }),
      ]);
    },
  });
}
