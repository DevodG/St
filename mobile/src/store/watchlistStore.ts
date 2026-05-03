import { create } from 'zustand';
import { getJson, setJson, storageKeys } from '../services/storage';

interface WatchlistState {
  symbols: string[];
  bootstrap: () => void;
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  symbols: [],
  bootstrap: () => set({ symbols: getJson<string[]>(storageKeys.watchlist) ?? [] }),
  add: (symbol) => {
    const next = [...new Set([...get().symbols, symbol.toUpperCase()])];
    setJson(storageKeys.watchlist, next);
    set({ symbols: next });
  },
  remove: (symbol) => {
    const next = get().symbols.filter((item) => item !== symbol.toUpperCase());
    setJson(storageKeys.watchlist, next);
    set({ symbols: next });
  },
}));
