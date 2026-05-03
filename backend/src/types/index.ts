export interface PriceData {
  priceCents: number;
  changeCents: number;
  changeBps: number;
  volumeK: number;
  timestamp: number;
}

export interface ServerToClientEvents {
  price_update: (data: PriceData & { symbol: string }) => void;
  order_filled: (data: { orderId: number; symbol: string; filledShares: number; avgPrice: number }) => void;
  achievement_earned: (data: { id: number; title: string; icon: string }) => void;
  price_alert_triggered: (data: { alertId: number; symbol: string; priceCents: number }) => void;
}

export interface ClientToServerEvents {
  subscribe_ticker: (symbol: string) => void;
  unsubscribe_ticker: (symbol: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: number;
}
