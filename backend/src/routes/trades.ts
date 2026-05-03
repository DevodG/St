import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const tradesRouter = Router();

tradesRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Trades endpoint' });
}));
