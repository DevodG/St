import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';

export interface PriceUpdate {
  symbol: string;
  priceCents: number;
  changeCents: number;
  changeBps: number;
  volumeK: number;
  timestamp: number;
}

export function useRealtimePrice(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    const upperSymbols = symbols.map((symbol) => symbol.toUpperCase());
    socket.emit('subscribe_symbols', { symbols: upperSymbols });
    const onUpdate = (payload: PriceUpdate) => setPrices((current) => ({ ...current, [payload.symbol]: payload }));
    socket.on('price_update', onUpdate);
    return () => {
      socket.emit('unsubscribe_symbols', { symbols: upperSymbols });
      socket.off('price_update', onUpdate);
    };
  }, [symbols.join('|')]);

  return prices;
}
