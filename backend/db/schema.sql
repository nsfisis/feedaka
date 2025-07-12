-- Feeds
CREATE TABLE IF NOT EXISTS feeds (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    url           TEXT NOT NULL,
    title         TEXT NOT NULL,
    fetched_at    TEXT NOT NULL,
    is_subscribed INTEGER NOT NULL DEFAULT 1
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id INTEGER NOT NULL,
    guid    TEXT NOT NULL,
    title   TEXT NOT NULL,
    url     TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE
);

-- Indice
CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id);

CREATE INDEX IF NOT EXISTS idx_articles_feed_guid ON articles(feed_id, guid);

CREATE INDEX IF NOT EXISTS idx_articles_is_read ON articles(is_read);
