import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const ordersRouter = Router();

ordersRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Orders endpoint' });
}));

ordersRouter.post('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Create order' });
}));
