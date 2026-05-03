import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface MLPrediction {
  signal: 'BUY' | 'HOLD' | 'SELL';
  confidence_pct: number;
  predicted_prices: number[];
  band_upper: number[];
  band_lower: number[];
  reasoning: string;
  current_price: number;
  horizon_days: number;
  generated_at: string;
}

export function useMLPrediction(symbol: string, horizon = '7d') {
  return useQuery({
    queryKey: ['ml-prediction', symbol, horizon],
    queryFn: async () => (await api.get<MLPrediction>(`/ml/predict/${symbol}`, { params: { horizon } })).data,
    staleTime: 300_000,
  });
}
