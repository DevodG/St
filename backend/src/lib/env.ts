import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().default('postgresql://stockly:stockly@localhost:5432/stockly'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16).default('dev-jwt-secret-change-in-prod'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-in-prod'),
  NVIDIA_NIM_API_KEY: z.string().default(''),
  NEWS_API_KEY: z.string().default(''),
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export const env = envSchema.parse(process.env);
