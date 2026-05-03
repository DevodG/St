import { db } from './index';
import { users, portfolios } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Check if demo user already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log('Database already seeded');
      process.exit(0);
    }

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    const [user] = await db.insert(users).values({
      email: 'demo@stockly.com',
      passwordHash,
      displayName: 'Demo User',
      riskLevel: 'balanced',
    }).returning();

    // Create portfolio with $100,000 starting cash
    await db.insert(portfolios).values({
      userId: user.id,
      name: 'My Portfolio',
      cashCents: 10_000_000, // $100,000
    });

    console.log('StockLy seed complete');
  } catch (error: any) {
    if (error.code === '42703') {
      console.log('Schema mismatch - skipping seed. Database may already have data.');
    } else {
      throw error;
    }
  }
  
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
