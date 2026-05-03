import { api } from './api';

export interface JournalTrade {
  id: string;
  portfolioId: string;
  symbol: string;
  tradeType: string;
  totalCents: number;
  executedAt: string | null;
}

export interface TradeJournal {
  id: string;
  userId: string;
  portfolioId: string;
  tradeId: string;
  thesis: string | null;
  tags: string[] | null;
  confidence: number | null;
  mood: string | null;
  lesson: string | null;
  mistakeCategory: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TradeJournalInput {
  thesis?: string;
  tags?: string[];
  confidence?: number;
  mood?: string;
  lesson?: string;
  mistakeCategory?: string;
}

export interface TradeJournalResponse {
  trade: JournalTrade;
  journal: TradeJournal | null;
}

export async function listTradeJournals(): Promise<Array<{ journal: TradeJournal; trade: JournalTrade }>> {
  return (await api.get<{ journals: Array<{ journal: TradeJournal; trade: JournalTrade }> }>('/journals')).data.journals;
}

export async function getTradeJournal(tradeId: string): Promise<TradeJournalResponse> {
  return (await api.get<TradeJournalResponse>(`/journals/${tradeId}`)).data;
}

export async function saveTradeJournal(tradeId: string, input: TradeJournalInput): Promise<TradeJournalResponse> {
  return (await api.put<TradeJournalResponse>(`/journals/${tradeId}`, input)).data;
}
