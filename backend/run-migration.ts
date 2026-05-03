import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import { env } from './src/lib/env';

async function runMigration() {
  const sql = postgres(env.DATABASE_URL);
  
  try {
    const migration = readFileSync('./src/db/migrations/0000_initial.sql', 'utf-8');
    await sql.unsafe(migration);
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration().catch(() => process.exit(1));
