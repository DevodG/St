import axios from 'axios';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { marketDataSnapshots } from '../db/schema';
import { env } from '../lib/env';
import { redis } from '../lib/redis';
import type { PriceData } from '../types';

export interface StockQuote {
  symbol: string;
  name: string;
  priceCents: number;
  changeCents: number;
  changeBps: number;
  volumeK: number;
  marketCapCents: number;
  sector: string;
  timestamp: number;
}

const BASE_QUOTES: StockQuote[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', priceCents: 17850, changeCents: 125, changeBps: 71, volumeK: 54320, marketCapCents: 2_800_000_000_000_00, sector: 'Technology', timestamp: Date.now() },
  { symbol: 'MSFT', name: 'Microsoft Corp.', priceCents: 37800, changeCents: -210, changeBps: -55, volumeK: 32100, marketCapCents: 2_900_000_000_000_00, sector: 'Technology', timestamp: Date.now() },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', priceCents: 14100, changeCents: 85, changeBps: 61, volumeK: 28700, marketCapCents: 1_750_000_000_000_00, sector: 'Communication Services', timestamp: Date.now() },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', priceCents: 17800, changeCents: 320, changeBps: 183, volumeK: 41000, marketCapCents: 1_850_000_000_000_00, sector: 'Consumer Cyclical', timestamp: Date.now() },
  { symbol: 'TSLA', name: 'Tesla Inc.', priceCents: 24800, changeCents: -450, changeBps: -178, volumeK: 90000, marketCapCents: 790_000_000_000_00, sector: 'Consumer Cyclical', timestamp: Date.now() },
];

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function fallbackQuote(symbol: string): StockQuote {
  const normalized = normalizeSymbol(symbol);
  const known = BASE_QUOTES.find((quote) => quote.symbol === normalized);
  if (known) {
    return { ...known, timestamp: Date.now() };
  }

  const seed = [...normalized].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const priceCents = 5_000 + seed * 137;
  const changeBps = (seed % 500) - 250;
  const changeCents = Math.round((priceCents * changeBps) / 10_000);
  return {
    symbol: normalized,
    name: `${normalized} Holdings`,
    priceCents,
    changeCents,
    changeBps,
    volumeK: 10_000 + seed * 10,
    marketCapCents: priceCents * 10_000_000,
    sector: 'Unknown',
    timestamp: Date.now(),
  };
}

async function readCachedQuote(symbol: string): Promise<StockQuote | null> {
  const cached = await redis.hgetall(`prices:${symbol}`);
  if (!cached.priceCents) {
    return null;
  }
  return {
    symbol,
    name: cached.name ?? symbol,
    priceCents: Number(cached.priceCents),
    changeCents: Number(cached.changeCents ?? 0),
    changeBps: Number(cached.changeBps ?? 0),
    volumeK: Number(cached.volumeK ?? 0),
    marketCapCents: Number(cached.marketCapCents ?? 0),
    sector: cached.sector ?? 'Unknown',
    timestamp: Number(cached.timestamp ?? Date.now()),
  };
}

async function writeCachedQuote(quote: StockQuote): Promise<void> {
  await redis.hset(`prices:${quote.symbol}`, {
    name: quote.name,
    priceCents: quote.priceCents.toString(),
    changeCents: quote.changeCents.toString(),
    changeBps: quote.changeBps.toString(),
    volumeK: quote.volumeK.toString(),
    marketCapCents: quote.marketCapCents.toString(),
    sector: quote.sector,
    timestamp: quote.timestamp.toString(),
  });
  await redis.expire(`prices:${quote.symbol}`, 60);
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  const normalized = normalizeSymbol(symbol);
  const cached = await readCachedQuote(normalized);
  if (cached && Date.now() - cached.timestamp < 60_000) {
    return cached;
  }

  try {
    const response = await axios.get<StockQuote>(`${env.ML_SERVICE_URL}/quote/${encodeURIComponent(normalized)}`, { timeout: 4_000 });
    const quote = { ...response.data, symbol: normalized, timestamp: Date.now() };
    await writeCachedQuote(quote);
    return quote;
  } catch {
    const quote = fallbackQuote(normalized);
    await writeCachedQuote(quote);
    return quote;
  }
}

export async function getQuotes(symbols: string[]): Promise<StockQuote[]> {
  const uniqueSymbols = [...new Set(symbols.map(normalizeSymbol).filter(Boolean))];
  return Promise.all(uniqueSymbols.map((symbol) => getQuote(symbol)));
}

export async function searchMarket(query: string, limit: number): Promise<StockQuote[]> {
  const normalized = query.trim().toLowerCase();
  const matches = BASE_QUOTES.filter((quote) => quote.symbol.toLowerCase().includes(normalized) || quote.name.toLowerCase().includes(normalized));
  return matches.slice(0, limit).map((quote) => ({ ...quote, timestamp: Date.now() }));
}

export async function publishPriceUpdate(symbol: string): Promise<PriceData & { symbol: string }> {
  const quote = await getQuote(symbol);
  const payload = {
    symbol: quote.symbol,
    priceCents: quote.priceCents,
    changeCents: quote.changeCents,
    changeBps: quote.changeBps,
    volumeK: quote.volumeK,
    timestamp: quote.timestamp,
  };
  await redis.publish('price_updates', JSON.stringify(payload));
  return payload;
}

export const defaultSymbols = BASE_QUOTES.map((quote) => quote.symbol);
