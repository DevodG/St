import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, portfolios, refreshTokens } from '../db/schema';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { UnauthorizedError } from '../lib/errors';
import { eq } from 'drizzle-orm';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(async (req, res) => {
  const { email, password, displayName } = req.body;
  
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({
    email,
    passwordHash,
    displayName,
  }).returning();

  await db.insert(portfolios).values({
    userId: user.id,
    name: 'My Portfolio',
    cashCents: 10_000_000,
  });

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, displayName: user.displayName } });
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, displayName: user.displayName } });
}));

authRouter.get('/me', asyncHandler(async (req, res) => {
  res.json({ message: 'Auth endpoint' });
}));
