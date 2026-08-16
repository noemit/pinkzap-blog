-- Schema for tracking search queries typed into the blog's search box.
-- The app also creates this table automatically on first use, so running this
-- is optional. You can run it in the Neon console's SQL editor for reference.

CREATE TABLE IF NOT EXISTS search_queries (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  source TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
