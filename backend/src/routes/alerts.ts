import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const alertsRouter = Router();

alertsRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Alerts endpoint' });
}));
