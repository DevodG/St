-- Create enums
CREATE TYPE "risk_level" AS ENUM('conservative', 'balanced', 'aggressive');
CREATE TYPE "order_type" AS ENUM('MARKET', 'LIMIT');
CREATE TYPE "order_side" AS ENUM('BUY', 'SELL');
CREATE TYPE "order_status" AS ENUM('NEW', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'REJECTED');
CREATE TYPE "time_in_force" AS ENUM('DAY', 'GTC', 'IOC');
CREATE TYPE "alert_status" AS ENUM('ACTIVE', 'TRIGGERED', 'DISMISSED');
CREATE TYPE "alert_direction" AS ENUM('ABOVE', 'BELOW');

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "display_name" VARCHAR(100) NOT NULL,
  "risk_level" "risk_level" DEFAULT 'balanced' NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token" VARCHAR(500) NOT NULL UNIQUE,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Device sessions
CREATE TABLE IF NOT EXISTS "device_sessions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "device_id" VARCHAR(255) NOT NULL,
  "device_name" VARCHAR(255),
  "refresh_token_id" INTEGER REFERENCES "refresh_tokens"("id") ON DELETE SET NULL,
  "last_active_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "device_sessions_user_device_idx" ON "device_sessions"("user_id", "device_id");

-- Portfolios
CREATE TABLE IF NOT EXISTS "portfolios" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) DEFAULT 'My Portfolio' NOT NULL,
  "cash_cents" INTEGER DEFAULT 10000000 NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Holdings
CREATE TABLE IF NOT EXISTS "holdings" (
  "id" SERIAL PRIMARY KEY,
  "portfolio_id" INTEGER NOT NULL REFERENCES "portfolios"("id") ON DELETE CASCADE,
  "symbol" VARCHAR(20) NOT NULL,
  "shares_times_1000" INTEGER NOT NULL,
  "avg_cost_cents" INTEGER NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "portfolio_id" INTEGER NOT NULL REFERENCES "portfolios"("id"),
  "symbol" VARCHAR(20) NOT NULL,
  "order_type" "order_type" NOT NULL,
  "side" "order_side" NOT NULL,
  "shares_times_1000" INTEGER NOT NULL,
  "limit_price_cents" INTEGER,
  "filled_shares_times_1000" INTEGER DEFAULT 0 NOT NULL,
  "avg_fill_price_cents" INTEGER,
  "status" "order_status" DEFAULT 'NEW' NOT NULL,
  "time_in_force" "time_in_force" DEFAULT 'DAY' NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "orders_user_status_idx" ON "orders"("user_id", "status");
CREATE INDEX IF NOT EXISTS "orders_portfolio_created_idx" ON "orders"("portfolio_id", "created_at");
CREATE INDEX IF NOT EXISTS "orders_symbol_status_idx" ON "orders"("symbol", "status");

-- Order events
CREATE TABLE IF NOT EXISTS "order_events" (
  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "event_type" VARCHAR(50) NOT NULL,
  "message" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "order_events_order_created_idx" ON "order_events"("order_id", "created_at");

-- Trades
CREATE TABLE IF NOT EXISTS "trades" (
  "id" SERIAL PRIMARY KEY,
  "portfolio_id" INTEGER NOT NULL REFERENCES "portfolios"("id"),
  "order_id" INTEGER NOT NULL REFERENCES "orders"("id"),
  "symbol" VARCHAR(20) NOT NULL,
  "side" "order_side" NOT NULL,
  "shares_times_1000" INTEGER NOT NULL,
  "price_cents" INTEGER NOT NULL,
  "executed_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "trades_portfolio_executed_idx" ON "trades"("portfolio_id", "executed_at");

-- Ledger entries
CREATE TABLE IF NOT EXISTS "ledger_entries" (
  "id" SERIAL PRIMARY KEY,
  "portfolio_id" INTEGER NOT NULL REFERENCES "portfolios"("id"),
  "order_id" INTEGER REFERENCES "orders"("id"),
  "entry_type" VARCHAR(50) NOT NULL,
  "amount_cents" INTEGER NOT NULL,
  "balance_cents" INTEGER NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "ledger_entries_portfolio_created_idx" ON "ledger_entries"("portfolio_id", "created_at");

-- Watchlist
CREATE TABLE IF NOT EXISTS "watchlist" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "symbol" VARCHAR(20) NOT NULL,
  "added_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "watchlist_user_symbol_idx" ON "watchlist"("user_id", "symbol");

-- Price alerts
CREATE TABLE IF NOT EXISTS "price_alerts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "symbol" VARCHAR(20) NOT NULL,
  "direction" "alert_direction" NOT NULL,
  "target_price_cents" INTEGER NOT NULL,
  "status" "alert_status" DEFAULT 'ACTIVE' NOT NULL,
  "triggered_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "price_alerts_symbol_status_idx" ON "price_alerts"("symbol", "status");
CREATE INDEX IF NOT EXISTS "price_alerts_user_status_idx" ON "price_alerts"("user_id", "status");

-- Trade journals
CREATE TABLE IF NOT EXISTS "trade_journals" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "portfolio_id" INTEGER NOT NULL REFERENCES "portfolios"("id") ON DELETE CASCADE,
  "trade_id" INTEGER NOT NULL REFERENCES "trades"("id"),
  "thesis" TEXT,
  "mood" VARCHAR(50),
  "confidence_pct" INTEGER,
  "lessons_learned" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "trade_journals_user_trade_idx" ON "trade_journals"("user_id", "trade_id");

-- Portfolio snapshots
CREATE TABLE IF NOT EXISTS "portfolio_snapshots" (
  "id" SERIAL PRIMARY KEY,
  "portfolio_id" INTEGER NOT NULL REFERENCES "portfolios"("id") ON DELETE CASCADE,
  "total_value_cents" INTEGER NOT NULL,
  "cash_cents" INTEGER NOT NULL,
  "return_bps" INTEGER NOT NULL,
  "source" VARCHAR(50) DEFAULT 'system' NOT NULL,
  "captured_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS "leaderboard" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "portfolio_id" INTEGER NOT NULL REFERENCES "portfolios"("id"),
  "display_name" VARCHAR(100) NOT NULL,
  "return_bps" INTEGER NOT NULL,
  "rank" INTEGER NOT NULL,
  "period" VARCHAR(20) NOT NULL,
  "snapshot_date" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "leaderboard_user_period_snapshot_idx" ON "leaderboard"("user_id", "period", "snapshot_date");

-- Chat messages
CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "session_id" VARCHAR(100) NOT NULL,
  "role" VARCHAR(20) NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "chat_messages_user_session_idx" ON "chat_messages"("user_id", "session_id");

-- Achievements
CREATE TABLE IF NOT EXISTS "achievements" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "badge_key" VARCHAR(100) NOT NULL,
  "earned_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "achievements_user_badge_idx" ON "achievements"("user_id", "badge_key");

-- Market data snapshots
CREATE TABLE IF NOT EXISTS "market_data_snapshots" (
  "id" SERIAL PRIMARY KEY,
  "symbol" VARCHAR(20) NOT NULL,
  "provider" VARCHAR(50) NOT NULL,
  "price_cents" INTEGER NOT NULL,
  "bid_cents" INTEGER,
  "ask_cents" INTEGER,
  "change_bps" INTEGER,
  "volume_k" INTEGER,
  "is_stale" BOOLEAN DEFAULT FALSE NOT NULL,
  "captured_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "market_data_snapshots_symbol_captured_idx" ON "market_data_snapshots"("symbol", "captured_at");
