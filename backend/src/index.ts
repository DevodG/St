import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from './lib/env';
import { redis } from './lib/redis';
import { authenticatedRateLimiter, publicRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { authRouter } from './routes/auth';
import { portfolioRouter } from './routes/portfolio';
import { watchlistRouter } from './routes/watchlist';
import { leaderboardRouter } from './routes/leaderboard';
import { tradesRouter } from './routes/trades';
import { ordersRouter } from './routes/orders';
import { marketRouter } from './routes/market';
import { chatRouter } from './routes/chat';
import { mlRouter } from './routes/ml';
import { alertsRouter } from './routes/alerts';
import { journalsRouter } from './routes/journals';
import { educationRouter } from './routes/education';
import { achievementsRouter } from './routes/achievements';
import { startLeaderboardJob } from './jobs/leaderboardJob';
import { startPriceFetcherJob } from './jobs/priceFetcherJob';
import { startSnapshotJob } from './jobs/snapshotJob';
import { registerPriceSocket } from './websocket/priceSocket';
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './types';

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(publicRateLimiter);

app.get('/', (_req, res) => {
  res.json({ message: 'StockLy API', status: 'ok' });
});

app.get('/health', async (_req, res) => {
  const redisStatus = redis.status;
  res.json({ status: 'ok', redis: redisStatus });
});

app.use('/auth', authRouter);
app.use('/market', marketRouter);
app.use('/ml', mlRouter);
app.use(educationRouter);
app.use(authMiddleware, authenticatedRateLimiter);
app.use('/portfolio', portfolioRouter);
app.use('/orders', ordersRouter);
app.use('/trades', tradesRouter);
app.use('/watchlist', watchlistRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/chat', chatRouter);
app.use('/alerts', alertsRouter);
app.use('/journals', journalsRouter);
app.use('/achievements', achievementsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    console.log('🚀 Starting StockLy API...');
    
    console.log('📡 Connecting to Redis...');
    await redis.connect();
    console.log('✅ Redis connected successfully');
    
    console.log('🔌 Registering WebSocket handlers...');
    await registerPriceSocket(io);
    console.log('✅ WebSocket handlers registered');
    
    httpServer.listen(env.PORT, () => {
      console.log(`✅ StockLy API running on port ${env.PORT}`);
      console.log(`📊 Health check: http://localhost:${env.PORT}/health`);
    });
    
    // Start background jobs after server is listening
    if (env.NODE_ENV !== 'test') {
      console.log('⏰ Starting background jobs...');
      Promise.all([
        startPriceFetcherJob().catch(err => console.error('Price fetcher job failed:', err)),
        startLeaderboardJob().catch(err => console.error('Leaderboard job failed:', err)),
        startSnapshotJob().catch(err => console.error('Snapshot job failed:', err))
      ]).then(() => {
        console.log('✅ Background jobs started');
      });
    }
  } catch (error) {
    console.error('❌ Failed to start StockLy API:', error);
    throw error;
  }
}

void start().catch((error: unknown) => {
  console.error('Failed to start StockLy API:', error);
  process.exit(1);
});
