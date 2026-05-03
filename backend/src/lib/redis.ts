import Redis from 'ioredis';
import { env } from './env';

const redisOptions: any = {
  maxRetriesPerRequest: null, // No limit for initial connection
  lazyConnect: true, // Don't connect immediately
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    if (times > 10) {
      console.error('Redis: Stopping retry after 10 attempts');
      return null;
    }
    const delay = Math.min(times * 100, 3000);
    console.log(`Redis: Retry attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
  connectTimeout: 10000,
};

if (env.REDIS_URL.startsWith('rediss://')) {
  redisOptions.tls = {
    rejectUnauthorized: false,
  };
}

export const redis = new Redis(env.REDIS_URL, redisOptions);

export const redisSubscriber = new Redis(env.REDIS_URL, redisOptions);

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('ready', () => {
  console.log('✅ Redis ready');
});

redisSubscriber.on('error', (err) => {
  console.error('Redis subscriber error:', err.message);
});
