import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const portfolioRouter = Router();

portfolioRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Portfolio endpoint' });
}));
