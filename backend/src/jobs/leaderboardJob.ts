import Queue from 'bull';
import { env } from '../lib/env';

const redisConfig = {
  redis: env.REDIS_URL,
};

const queue = new Queue('leaderboard-refresh', redisConfig);

queue.process(async () => {
  console.log('Leaderboard job running');
});

export async function startLeaderboardJob() {
  await queue.add({}, { repeat: { every: 21600000 } });
}
