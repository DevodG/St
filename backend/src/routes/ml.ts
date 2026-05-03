import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const mlRouter = Router();

mlRouter.get('/prediction/:symbol', asyncHandler(async (req, res) => {
  res.json({ message: 'ML prediction endpoint' });
}));
