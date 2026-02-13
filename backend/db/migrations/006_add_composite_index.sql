CREATE INDEX IF NOT EXISTS idx_articles_feed_read_id ON articles(feed_id, is_read, id DESC);
