import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getJournal, listJournals, updateJournal, type JournalUpdateInput } from '../services/journal';

export function useJournals(limit?: number) {
  return useQuery({
    queryKey: ['journals', limit],
    queryFn: () => listJournals(limit),
  });
}

export function useJournal(tradeId: string | null) {
  return useQuery({
    queryKey: ['journal', tradeId],
    queryFn: () => getJournal(String(tradeId)),
    enabled: Boolean(tradeId),
  });
}

export function useUpdateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tradeId, input }: { tradeId: string; input: JournalUpdateInput }) => updateJournal(tradeId, input),
    onSuccess: (_data, { tradeId }) => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['journal', tradeId] });
    },
  });
}
