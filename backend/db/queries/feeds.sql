-- name: GetFeed :one
SELECT id, url, title, fetched_at, is_subscribed, user_id
FROM feeds
WHERE id = ? AND user_id = ?;

-- name: GetFeeds :many
SELECT id, url, title, fetched_at, is_subscribed, user_id
FROM feeds
WHERE is_subscribed = 1 AND user_id = ?
ORDER BY id;

-- name: CreateFeed :one
INSERT INTO feeds (url, title, fetched_at, user_id)
VALUES (?, ?, ?, ?)
RETURNING *;

-- name: UpdateFeedMetadata :exec
UPDATE feeds
SET title = ?, fetched_at = ?
WHERE id = ?;

-- name: DeleteFeed :exec
DELETE FROM feeds
WHERE id = ?;

-- name: GetFeedByURL :one
SELECT id, url, title, fetched_at, is_subscribed, user_id
FROM feeds
WHERE url = ? AND user_id = ?;

-- name: GetFeedsToFetch :many
SELECT id, url, fetched_at, user_id
FROM feeds
WHERE is_subscribed = 1;

-- name: UnsubscribeFeed :exec
UPDATE feeds
SET is_subscribed = 0
WHERE id = ?;
