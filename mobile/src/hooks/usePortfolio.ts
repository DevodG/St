import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { usePortfolioStore } from '../store/portfolioStore';

export function usePortfolio() {
  const setSnapshot = usePortfolioStore((state) => state.setSnapshot);
  const query = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => (await api.get('/portfolio')).data as Parameters<typeof setSnapshot>[0],
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) setSnapshot(query.data);
  }, [query.data, setSnapshot]);

  return query;
}
