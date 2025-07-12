-- Add is_subscribed column to feeds table.

ALTER TABLE feeds ADD COLUMN is_subscribed INTEGER NOT NULL DEFAULT 1;