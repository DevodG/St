#!/bin/bash

# This script generates all remaining backend files
# Run with: bash generate-remaining.sh

echo "Generating remaining StockLy backend files..."

# Create minimal route files
cat > src/routes/auth.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, portfolios, refreshTokens } from '../db/schema';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { BadRequestError, UnauthorizedError } from '../lib/errors';
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
EOF

cat > src/routes/market.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { getQuote, searchMarket } from '../services/priceService';

export const marketRouter = Router();

marketRouter.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  const results = await searchMarket(q as string, 10);
  res.json(results);
}));

marketRouter.get('/quote/:symbol', asyncHandler(async (req, res) => {
  const quote = await getQuote(req.params.symbol);
  res.json(quote);
}));
EOF

cat > src/routes/portfolio.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const portfolioRouter = Router();

portfolioRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Portfolio endpoint' });
}));
EOF

cat > src/routes/orders.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const ordersRouter = Router();

ordersRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Orders endpoint' });
}));

ordersRouter.post('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Create order' });
}));
EOF

cat > src/routes/trades.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const tradesRouter = Router();

tradesRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Trades endpoint' });
}));
EOF

cat > src/routes/watchlist.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const watchlistRouter = Router();

watchlistRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Watchlist endpoint' });
}));
EOF

cat > src/routes/leaderboard.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Leaderboard endpoint' });
}));
EOF

cat > src/routes/chat.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const chatRouter = Router();

chatRouter.post('/stream', asyncHandler(async (req, res) => {
  res.json({ message: 'Chat endpoint' });
}));
EOF

cat > src/routes/ml.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const mlRouter = Router();

mlRouter.get('/prediction/:symbol', asyncHandler(async (req, res) => {
  res.json({ message: 'ML prediction endpoint' });
}));
EOF

cat > src/routes/alerts.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const alertsRouter = Router();

alertsRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Alerts endpoint' });
}));
EOF

cat > src/routes/journals.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const journalsRouter = Router();

journalsRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Journals endpoint' });
}));
EOF

cat > src/routes/education.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const educationRouter = Router();

educationRouter.get('/lessons', asyncHandler(async (req, res) => {
  res.json({ message: 'Education endpoint' });
}));
EOF

cat > src/routes/achievements.ts << 'EOF'
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';

export const achievementsRouter = Router();

achievementsRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Achievements endpoint' });
}));
EOF

# Create job files
cat > src/jobs/priceFetcherJob.ts << 'EOF'
import Queue from 'bull';
import { redis } from '../lib/redis';
import { defaultSymbols, publishPriceUpdate } from '../services/priceService';

const queue = new Queue('price-fetcher', { redis: redis as any });

queue.process(async () => {
  await Promise.all(defaultSymbols.map(publishPriceUpdate));
});

export async function startPriceFetcherJob() {
  await queue.add({}, { repeat: { every: 60000 } });
}
EOF

cat > src/jobs/snapshotJob.ts << 'EOF'
import Queue from 'bull';
import { redis } from '../lib/redis';

const queue = new Queue('portfolio-snapshots', { redis: redis as any });

queue.process(async () => {
  console.log('Snapshot job running');
});

export async function startSnapshotJob() {
  await queue.add({}, { repeat: { cron: '0 0 * * *' } });
}
EOF

cat > src/jobs/leaderboardJob.ts << 'EOF'
import Queue from 'bull';
import { redis } from '../lib/redis';

const queue = new Queue('leaderboard-refresh', { redis: redis as any });

queue.process(async () => {
  console.log('Leaderboard job running');
});

export async function startLeaderboardJob() {
  await queue.add({}, { repeat: { every: 21600000 } });
}
EOF

# Create websocket handler
cat > src/websocket/priceSocket.ts << 'EOF'
import type { Server } from 'socket.io';
import { verifyAccessToken } from '../lib/jwt';
import { redisSubscriber } from '../lib/redis';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../types';

export async function registerPriceSocket(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('subscribe_ticker', (symbol) => {
      socket.join(`ticker:${symbol}`);
    });

    socket.on('unsubscribe_ticker', (symbol) => {
      socket.leave(`ticker:${symbol}`);
    });
  });

  await redisSubscriber.subscribe('price_updates');
  redisSubscriber.on('message', (_channel, message) => {
    const data = JSON.parse(message);
    io.to(`ticker:${data.symbol}`).emit('price_update', data);
  });
}
EOF

echo "All files generated successfully!"
EOF
