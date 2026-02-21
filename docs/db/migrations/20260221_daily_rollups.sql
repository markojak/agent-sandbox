-- MVP daily rollups table for per-user per-day materialized totals and insights backing metrics.
CREATE TABLE IF NOT EXISTS daily_rollups (
  user_id TEXT NOT NULL,
  rollup_date DATE NOT NULL,
  total_calories INTEGER NOT NULL DEFAULT 0,
  entry_count INTEGER NOT NULL DEFAULT 0,
  has_logs BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, rollup_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_rollups_user_date_desc
  ON daily_rollups (user_id, rollup_date DESC);
