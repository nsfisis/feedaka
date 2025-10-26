-- Add users table and user_id column to feeds table.

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id to feeds table
ALTER TABLE feeds ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Index for feeds.user_id
CREATE INDEX IF NOT EXISTS idx_feeds_user_id ON feeds(user_id);
