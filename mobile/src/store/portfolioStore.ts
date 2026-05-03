import { create } from 'zustand';

export interface Holding {
  id: string;
  symbol: string;
  companyName: string | null;
  sharesTimes1000: number;
  avgCostCents: number;
  currentPriceCents: number;
  marketValueCents: number;
  unrealizedPnlCents: number;
  unrealizedPnlBps: number;
}

interface PortfolioState {
  cashCents: number;
  totalValueCents: number;
  investedCents: number;
  returnBps: number;
  holdings: Holding[];
  setSnapshot: (snapshot: { portfolio: { cashCents: number }; totalValueCents: number; investedCents: number; returnBps: number; holdings: Holding[] }) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  cashCents: 10_000_000,
  totalValueCents: 10_000_000,
  investedCents: 0,
  returnBps: 0,
  holdings: [],
  setSnapshot: (snapshot) => set({ cashCents: snapshot.portfolio.cashCents, totalValueCents: snapshot.totalValueCents, investedCents: snapshot.investedCents, returnBps: snapshot.returnBps, holdings: snapshot.holdings }),
}));
