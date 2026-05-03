import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { getQuote, searchMarket } from '../services/priceService';

export const marketRouter = Router();

marketRouter.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  const results = await searchMarket(q as string, 10);
  res.json(results);
}));

marketRouter.get('/quote/:symbol', asyncHandler(async (req, res) => {
  const quote = await getQuote(req.params.symbol);
  res.json(quote);
}));
