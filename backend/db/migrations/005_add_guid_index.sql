-- Add index on guid for deduplication
CREATE INDEX IF NOT EXISTS idx_articles_guid ON articles(guid);

-- Remove duplicate articles by guid, keeping only the one with the smallest id
DELETE FROM articles
WHERE id NOT IN (
    SELECT MIN(id)
    FROM articles
    GROUP BY guid
);
