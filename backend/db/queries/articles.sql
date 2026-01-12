-- name: GetArticle :one
SELECT
    a.id, a.feed_id, a.guid, a.title, a.url, a.is_read,
    f.id as feed_id_2, f.url as feed_url, f.title as feed_title, f.is_subscribed as feed_is_subscribed
FROM articles AS a
INNER JOIN feeds AS f ON a.feed_id = f.id
WHERE a.id = ?;

-- name: GetUnreadArticles :many
SELECT
    a.id, a.feed_id, a.guid, a.title, a.url, a.is_read,
    f.id as feed_id_2, f.url as feed_url, f.title as feed_title, f.is_subscribed as feed_is_subscribed
FROM articles AS a
INNER JOIN feeds AS f ON a.feed_id = f.id
WHERE a.is_read = 0 AND f.is_subscribed = 1 AND f.user_id = ?
ORDER BY a.id DESC
LIMIT 100;

-- name: GetReadArticles :many
SELECT
    a.id, a.feed_id, a.guid, a.title, a.url, a.is_read,
    f.id as feed_id_2, f.url as feed_url, f.title as feed_title, f.is_subscribed as feed_is_subscribed
FROM articles AS a
INNER JOIN feeds AS f ON a.feed_id = f.id
WHERE a.is_read = 1 AND f.is_subscribed = 1 AND f.user_id = ?
ORDER BY a.id DESC
LIMIT 100;

-- name: GetArticlesByFeed :many
SELECT id, feed_id, guid, title, url, is_read
FROM articles
WHERE feed_id = ?
ORDER BY id DESC;

-- name: GetArticleGUIDsByFeed :many
SELECT guid
FROM articles
WHERE feed_id = ?;

-- name: CreateArticle :one
INSERT INTO articles (feed_id, guid, title, url, is_read)
VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: UpdateArticle :exec
UPDATE articles
SET title = ?, url = ?
WHERE feed_id = ? AND guid = ?;

-- name: UpdateArticleReadStatus :exec
UPDATE articles
SET is_read = ?
WHERE id = ?;

-- name: MarkFeedArticlesRead :exec
UPDATE articles
SET is_read = 1
WHERE feed_id = ?;

-- name: MarkFeedArticlesUnread :exec
UPDATE articles
SET is_read = 0
WHERE feed_id = ?;

-- name: DeleteArticlesByFeed :exec
DELETE FROM articles
WHERE feed_id = ?;

-- name: CheckArticleExists :one
SELECT EXISTS(
    SELECT 1 FROM articles
    WHERE feed_id = ? AND guid = ?
) as article_exists;

-- name: CheckArticleExistsByGUID :one
SELECT EXISTS(
    SELECT 1 FROM articles
    WHERE guid = ?
) as article_exists;

-- name: GetAllArticleGUIDs :many
SELECT DISTINCT guid
FROM articles;
