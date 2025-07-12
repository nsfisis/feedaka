-- name: GetFeed :one
SELECT id, url, title, fetched_at
FROM feeds
WHERE id = ?;

-- name: GetFeeds :many
SELECT id, url, title, fetched_at
FROM feeds
ORDER BY id;

-- name: CreateFeed :one
INSERT INTO feeds (url, title, fetched_at)
VALUES (?, ?, ?)
RETURNING *;

-- name: UpdateFeedMetadata :exec
UPDATE feeds
SET title = ?, fetched_at = ?
WHERE id = ?;

-- name: DeleteFeed :exec
DELETE FROM feeds
WHERE id = ?;

-- name: GetFeedByURL :one
SELECT id, url, title, fetched_at
FROM feeds
WHERE url = ?;

-- name: GetFeedsToFetch :many
SELECT id, url, fetched_at
FROM feeds;
