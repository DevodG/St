import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Leaderboard endpoint' });
}));
