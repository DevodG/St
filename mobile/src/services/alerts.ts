import { api } from './api';

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPriceCents: number;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISMISSED';
  triggeredAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

export interface CreateAlertInput {
  symbol: string;
  condition: 'above' | 'below';
  targetPriceCents: number;
}

export async function listAlerts(): Promise<PriceAlert[]> {
  const response = await api.get('/alerts');
  return response.data;
}

export async function createAlert(input: CreateAlertInput): Promise<PriceAlert> {
  const response = await api.post('/alerts', input);
  return response.data;
}

export async function dismissAlert(id: string): Promise<PriceAlert> {
  const response = await api.put(`/alerts/${id}/dismiss`);
  return response.data;
}

export async function deleteAlert(id: string): Promise<{ ok: boolean }> {
  const response = await api.delete(`/alerts/${id}`);
  return response.data;
}
