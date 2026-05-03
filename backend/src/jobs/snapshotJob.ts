import Queue from 'bull';
import { env } from '../lib/env';

const redisConfig = {
  redis: env.REDIS_URL,
};

const queue = new Queue('portfolio-snapshots', redisConfig);

queue.process(async () => {
  console.log('Snapshot job running');
});

export async function startSnapshotJob() {
  await queue.add({}, { repeat: { cron: '0 0 * * *' } });
}
