import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const educationRouter = Router();

educationRouter.get('/lessons', asyncHandler(async (req, res) => {
  res.json({ message: 'Education endpoint' });
}));
