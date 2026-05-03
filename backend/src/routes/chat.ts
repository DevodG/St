import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const chatRouter = Router();

chatRouter.post('/stream', asyncHandler(async (req, res) => {
  res.json({ message: 'Chat endpoint' });
}));
