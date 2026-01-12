-- Add index on guid for deduplication queries
CREATE INDEX IF NOT EXISTS idx_articles_guid ON articles(guid);
