import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const watchlistRouter = Router();

watchlistRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Watchlist endpoint' });
}));
