import { pgTable, serial, varchar, integer, timestamp, boolean, text, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const riskLevelEnum = pgEnum('risk_level', ['conservative', 'balanced', 'aggressive']);
export const orderTypeEnum = pgEnum('order_type', ['MARKET', 'LIMIT']);
export const orderSideEnum = pgEnum('order_side', ['BUY', 'SELL']);
export const orderStatusEnum = pgEnum('order_status', ['NEW', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'REJECTED']);
export const timeInForceEnum = pgEnum('time_in_force', ['DAY', 'GTC', 'IOC']);
export const alertStatusEnum = pgEnum('alert_status', ['ACTIVE', 'TRIGGERED', 'DISMISSED']);
export const alertDirectionEnum = pgEnum('alert_direction', ['ABOVE', 'BELOW']);

// Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  riskLevel: riskLevelEnum('risk_level').default('balanced').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Refresh Tokens
export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Device Sessions
export const deviceSessions = pgTable('device_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  deviceId: varchar('device_id', { length: 255 }).notNull(),
  deviceName: varchar('device_name', { length: 255 }),
  refreshTokenId: integer('refresh_token_id').references(() => refreshTokens.id, { onDelete: 'set null' }),
  lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userDeviceIdx: uniqueIndex('device_sessions_user_device_idx').on(table.userId, table.deviceId),
}));

// Portfolios
export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).default('My Portfolio').notNull(),
  cashCents: integer('cash_cents').default(10000000).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Holdings
export const holdings = pgTable('holdings', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  sharesTimes1000: integer('shares_times_1000').notNull(),
  avgCostCents: integer('avg_cost_cents').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  orderType: orderTypeEnum('order_type').notNull(),
  side: orderSideEnum('side').notNull(),
  sharesTimes1000: integer('shares_times_1000').notNull(),
  limitPriceCents: integer('limit_price_cents'),
  filledSharesTimes1000: integer('filled_shares_times_1000').default(0).notNull(),
  avgFillPriceCents: integer('avg_fill_price_cents'),
  status: orderStatusEnum('status').default('NEW').notNull(),
  timeInForce: timeInForceEnum('time_in_force').default('DAY').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userStatusIdx: index('orders_user_status_idx').on(table.userId, table.status),
  portfolioCreatedIdx: index('orders_portfolio_created_idx').on(table.portfolioId, table.createdAt),
  symbolStatusIdx: index('orders_symbol_status_idx').on(table.symbol, table.status),
}));

// Order Events
export const orderEvents = pgTable('order_events', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orderCreatedIdx: index('order_events_order_created_idx').on(table.orderId, table.createdAt),
}));

// Trades
export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id),
  orderId: integer('order_id').notNull().references(() => orders.id),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  side: orderSideEnum('side').notNull(),
  sharesTimes1000: integer('shares_times_1000').notNull(),
  priceCents: integer('price_cents').notNull(),
  executedAt: timestamp('executed_at').defaultNow().notNull(),
}, (table) => ({
  portfolioExecutedIdx: index('trades_portfolio_executed_idx').on(table.portfolioId, table.executedAt),
}));

// Ledger Entries
export const ledgerEntries = pgTable('ledger_entries', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id),
  orderId: integer('order_id').references(() => orders.id),
  entryType: varchar('entry_type', { length: 50 }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  balanceCents: integer('balance_cents').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  portfolioCreatedIdx: index('ledger_entries_portfolio_created_idx').on(table.portfolioId, table.createdAt),
}));

// Watchlist
export const watchlist = pgTable('watchlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => ({
  userSymbolIdx: uniqueIndex('watchlist_user_symbol_idx').on(table.userId, table.symbol),
}));

// Price Alerts
export const priceAlerts = pgTable('price_alerts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  direction: alertDirectionEnum('direction').notNull(),
  targetPriceCents: integer('target_price_cents').notNull(),
  status: alertStatusEnum('status').default('ACTIVE').notNull(),
  triggeredAt: timestamp('triggered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  symbolStatusIdx: index('price_alerts_symbol_status_idx').on(table.symbol, table.status),
  userStatusIdx: index('price_alerts_user_status_idx').on(table.userId, table.status),
}));

// Trade Journals
export const tradeJournals = pgTable('trade_journals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  tradeId: integer('trade_id').notNull().references(() => trades.id),
  thesis: text('thesis'),
  mood: varchar('mood', { length: 50 }),
  confidencePct: integer('confidence_pct'),
  lessonsLearned: text('lessons_learned'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userTradeIdx: uniqueIndex('trade_journals_user_trade_idx').on(table.userId, table.tradeId),
}));

// Portfolio Snapshots
export const portfolioSnapshots = pgTable('portfolio_snapshots', {
  id: serial('id').primaryKey(),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  totalValueCents: integer('total_value_cents').notNull(),
  cashCents: integer('cash_cents').notNull(),
  returnBps: integer('return_bps').notNull(),
  source: varchar('source', { length: 50 }).default('system').notNull(),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
});

// Leaderboard
export const leaderboard = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  portfolioId: integer('portfolio_id').notNull().references(() => portfolios.id),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  returnBps: integer('return_bps').notNull(),
  rank: integer('rank').notNull(),
  period: varchar('period', { length: 20 }).notNull(),
  snapshotDate: timestamp('snapshot_date').defaultNow().notNull(),
}, (table) => ({
  userPeriodSnapshotIdx: uniqueIndex('leaderboard_user_period_snapshot_idx').on(table.userId, table.period, table.snapshotDate),
}));

// Chat Messages
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userSessionIdx: index('chat_messages_user_session_idx').on(table.userId, table.sessionId),
}));

// Achievements
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  badgeKey: varchar('badge_key', { length: 100 }).notNull(),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
}, (table) => ({
  userBadgeIdx: uniqueIndex('achievements_user_badge_idx').on(table.userId, table.badgeKey),
}));

// Market Data Snapshots
export const marketDataSnapshots = pgTable('market_data_snapshots', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  priceCents: integer('price_cents').notNull(),
  bidCents: integer('bid_cents'),
  askCents: integer('ask_cents'),
  changeBps: integer('change_bps'),
  volumeK: integer('volume_k'),
  isStale: boolean('is_stale').default(false).notNull(),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
}, (table) => ({
  symbolCapturedIdx: index('market_data_snapshots_symbol_captured_idx').on(table.symbol, table.capturedAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  refreshTokens: many(refreshTokens),
  watchlist: many(watchlist),
  priceAlerts: many(priceAlerts),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, { fields: [portfolios.userId], references: [users.id] }),
  holdings: many(holdings),
  orders: many(orders),
  trades: many(trades),
  snapshots: many(portfolioSnapshots),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  portfolio: one(portfolios, { fields: [orders.portfolioId], references: [portfolios.id] }),
  events: many(orderEvents),
  trades: many(trades),
}));
