import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const achievementsRouter = Router();

achievementsRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Achievements endpoint' });
}));
