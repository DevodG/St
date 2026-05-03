import Queue from 'bull';
import { env } from '../lib/env';
import { defaultSymbols, publishPriceUpdate } from '../services/priceService';

const redisConfig = {
  redis: env.REDIS_URL,
};

const queue = new Queue('price-fetcher', redisConfig);

queue.process(async () => {
  await Promise.all(defaultSymbols.map(publishPriceUpdate));
});

export async function startPriceFetcherJob() {
  await queue.add({}, { repeat: { every: 60000 } });
}
