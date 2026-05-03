import { api } from './api';

export interface TradeJournal {
  id: string;
  userId: string;
  tradeId: string;
  thesis: string | null;
  tags: string[];
  confidence: number | null;
  mood: string | null;
  lesson: string | null;
  mistakeCategory: string | null;
  updatedAt: string;
}

export interface JournalUpdateInput {
  thesis?: string;
  tags?: string[];
  confidence?: number;
  mood?: string;
  lesson?: string;
  mistakeCategory?: string;
}

export async function listJournals(limit = 50): Promise<{ journals: Array<{ journal: TradeJournal; trade: any }> }> {
  const response = await api.get('/journals', { params: { limit } });
  return response.data;
}

export async function getJournal(tradeId: string): Promise<{ trade: any; journal: TradeJournal | null }> {
  const response = await api.get(`/journals/${tradeId}`);
  return response.data;
}

export async function updateJournal(tradeId: string, input: JournalUpdateInput): Promise<TradeJournal> {
  const response = await api.put(`/journals/${tradeId}`, input);
  return response.data.journal;
}
