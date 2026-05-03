import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const journalsRouter = Router();

journalsRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Journals endpoint' });
}));
