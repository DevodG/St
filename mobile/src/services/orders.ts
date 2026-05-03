import { api } from './api';

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'NEW' | 'ACCEPTED' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' | 'EXPIRED' | 'REJECTED';
export type TimeInForce = 'DAY' | 'GTC';

export interface SubmitOrderInput {
  symbol: string;
  type: OrderSide;
  sharesFloat?: number;
  amountCents?: number;
  orderType: OrderType;
  limitPriceCents?: number;
  timeInForce?: TimeInForce;
  expiresAt?: string;
  companyName?: string;
}

export interface Order {
  id: string;
  portfolioId: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  status: OrderStatus;
  timeInForce: TimeInForce;
  sharesTimes1000: number;
  filledSharesTimes1000: number;
  remainingSharesTimes1000: number;
  limitPriceCents: number | null;
  requestedNotionalCents: number | null;
  avgFillPriceCents: number | null;
  slippageBps: number;
  rejectionReason: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
  closedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  eventType: string;
  status: OrderStatus;
  message: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string | null;
}

export interface FillDecision {
  status: OrderStatus;
  filledSharesTimes1000: number;
  remainingSharesTimes1000: number;
  executionPriceCents: number | null;
  totalCents: number;
  slippageBps: number;
  rejectionReason?: string;
  message: string;
}

export interface SubmitOrderResult {
  order: Order;
  events: OrderEvent[];
  trade: unknown | null;
  updatedHolding: unknown | null;
  updatedCashCents: number;
  fill: FillDecision;
  warnings: string[];
}

export async function submitOrder(input: SubmitOrderInput): Promise<SubmitOrderResult> {
  return (await api.post<SubmitOrderResult>('/orders', input)).data;
}

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const response = await api.get<{ orders: Order[] }>('/orders', { params: status ? { status } : undefined });
  return response.data.orders;
}

export async function getOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const response = await api.get<{ events: OrderEvent[] }>(`/orders/${orderId}/events`);
  return response.data.events;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const response = await api.delete<{ order: Order }>(`/orders/${orderId}`);
  return response.data.order;
}
