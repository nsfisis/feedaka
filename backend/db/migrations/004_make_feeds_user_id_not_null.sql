-- Make feeds.user_id NOT NULL
--
-- SQLite does not support ALTER COLUMN directly, so we need to:
--  1. Temporarily disable foreign key constraints
--  2. Create a new table with the correct schema
--  3. Copy data from the old table
--  4. Drop the old table
--  5. Rename the new table
--  6. Re-enable foreign key constraints

-- Disable foreign key constraints temporarily
PRAGMA foreign_keys=OFF;

-- Create new feeds table with user_id NOT NULL
CREATE TABLE feeds_new (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    url           TEXT NOT NULL,
    title         TEXT NOT NULL,
    fetched_at    TEXT NOT NULL,
    is_subscribed INTEGER NOT NULL DEFAULT 1,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Copy data from old table (only rows with non-null user_id)
INSERT INTO feeds_new (id, url, title, fetched_at, is_subscribed, user_id)
SELECT id, url, title, fetched_at, is_subscribed, user_id
FROM feeds
WHERE user_id IS NOT NULL;

-- Drop old table (without cascading to articles since FK is disabled)
DROP TABLE feeds;

-- Rename new table
ALTER TABLE feeds_new RENAME TO feeds;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_feeds_user_id ON feeds(user_id);

-- Re-enable foreign key constraints
PRAGMA foreign_keys=ON;
