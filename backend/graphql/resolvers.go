package graphql

// THIS CODE WILL BE UPDATED WITH SCHEMA CHANGES. PREVIOUS IMPLEMENTATION FOR SCHEMA CHANGES WILL BE KEPT IN THE COMMENT SECTION. IMPLEMENTATION FOR UNCHANGED SCHEMA WILL BE KEPT.

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	"github.com/mmcdole/gofeed"

	"undef.ninja/x/feedaka/graphql/model"
)

type Resolver struct {
	DB *sql.DB
}

// AddFeed is the resolver for the addFeed field.
func (r *mutationResolver) AddFeed(ctx context.Context, url string) (*model.Feed, error) {
	// Fetch the feed to get its title
	fp := gofeed.NewParser()
	feed, err := fp.ParseURL(url)
	if err != nil {
		return nil, fmt.Errorf("failed to parse feed: %w", err)
	}

	// Insert the feed into the database
	result, err := r.DB.Exec(
		"INSERT INTO feeds (url, title, fetched_at) VALUES (?, ?, ?)",
		url, feed.Title, time.Now().UTC().Format(time.RFC3339),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert feed: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	// Insert articles from the feed
	for _, item := range feed.Items {
		_, err = r.DB.Exec(
			"INSERT INTO articles (feed_id, guid, title, url, is_read) VALUES (?, ?, ?, ?, ?)",
			id, item.GUID, item.Title, item.Link, 0,
		)
		if err != nil {
			// Log but don't fail on individual article errors
			fmt.Printf("Failed to insert article: %v\n", err)
		}
	}

	return &model.Feed{
		ID:        strconv.FormatInt(id, 10),
		URL:       url,
		Title:     feed.Title,
		FetchedAt: time.Now().Format(time.RFC3339),
	}, nil
}

// RemoveFeed is the resolver for the removeFeed field.
func (r *mutationResolver) RemoveFeed(ctx context.Context, id string) (bool, error) {
	feedID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return false, fmt.Errorf("invalid feed ID: %w", err)
	}

	// Start a transaction
	tx, err := r.DB.Begin()
	if err != nil {
		return false, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Delete articles first (foreign key constraint)
	_, err = tx.Exec("DELETE FROM articles WHERE feed_id = ?", feedID)
	if err != nil {
		return false, fmt.Errorf("failed to delete articles: %w", err)
	}

	// Delete the feed
	result, err := tx.Exec("DELETE FROM feeds WHERE id = ?", feedID)
	if err != nil {
		return false, fmt.Errorf("failed to delete feed: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return false, fmt.Errorf("feed not found")
	}

	err = tx.Commit()
	if err != nil {
		return false, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return true, nil
}

// MarkArticleRead is the resolver for the markArticleRead field.
func (r *mutationResolver) MarkArticleRead(ctx context.Context, id string) (*model.Article, error) {
	articleID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid article ID: %w", err)
	}

	// Update the article's read status
	_, err = r.DB.Exec("UPDATE articles SET is_read = 1 WHERE id = ?", articleID)
	if err != nil {
		return nil, fmt.Errorf("failed to mark article as read: %w", err)
	}

	// Fetch the updated article
	return r.Query().Article(ctx, id)
}

// MarkArticleUnread is the resolver for the markArticleUnread field.
func (r *mutationResolver) MarkArticleUnread(ctx context.Context, id string) (*model.Article, error) {
	articleID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid article ID: %w", err)
	}

	// Update the article's read status
	_, err = r.DB.Exec("UPDATE articles SET is_read = 0 WHERE id = ?", articleID)
	if err != nil {
		return nil, fmt.Errorf("failed to mark article as unread: %w", err)
	}

	// Fetch the updated article
	return r.Query().Article(ctx, id)
}

// MarkFeedRead is the resolver for the markFeedRead field.
func (r *mutationResolver) MarkFeedRead(ctx context.Context, id string) (*model.Feed, error) {
	feedID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid feed ID: %w", err)
	}

	// Update all articles in the feed to be read
	_, err = r.DB.Exec("UPDATE articles SET is_read = 1 WHERE feed_id = ?", feedID)
	if err != nil {
		return nil, fmt.Errorf("failed to mark feed as read: %w", err)
	}

	// Fetch the updated feed
	return r.Query().Feed(ctx, id)
}

// MarkFeedUnread is the resolver for the markFeedUnread field.
func (r *mutationResolver) MarkFeedUnread(ctx context.Context, id string) (*model.Feed, error) {
	feedID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid feed ID: %w", err)
	}

	// Update all articles in the feed to be unread
	_, err = r.DB.Exec("UPDATE articles SET is_read = 0 WHERE feed_id = ?", feedID)
	if err != nil {
		return nil, fmt.Errorf("failed to mark feed as unread: %w", err)
	}

	// Fetch the updated feed
	return r.Query().Feed(ctx, id)
}

// Feeds is the resolver for the feeds field.
func (r *queryResolver) Feeds(ctx context.Context) ([]*model.Feed, error) {
	rows, err := r.DB.Query("SELECT id, url, title, fetched_at FROM feeds")
	if err != nil {
		return nil, fmt.Errorf("failed to query feeds: %w", err)
	}
	defer rows.Close()

	var feeds []*model.Feed
	for rows.Next() {
		var feed model.Feed
		err := rows.Scan(&feed.ID, &feed.URL, &feed.Title, &feed.FetchedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan feed: %w", err)
		}
		feeds = append(feeds, &feed)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over feeds: %w", err)
	}

	return feeds, nil
}

// UnreadArticles is the resolver for the unreadArticles field.
func (r *queryResolver) UnreadArticles(ctx context.Context) ([]*model.Article, error) {
	rows, err := r.DB.Query(`
		SELECT a.id, a.feed_id, a.guid, a.title, a.url, a.is_read,
		       f.id, f.url, f.title
		FROM articles AS a
		INNER JOIN feeds AS f ON a.feed_id = f.id
		WHERE a.is_read = 0
		ORDER BY a.id DESC
		LIMIT 100
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to query unread articles: %w", err)
	}
	defer rows.Close()

	var articles []*model.Article
	for rows.Next() {
		var article model.Article
		var feed model.Feed
		var isRead int
		err := rows.Scan(
			&article.ID, &article.FeedID, &article.GUID, &article.Title, &article.URL, &isRead,
			&feed.ID, &feed.URL, &feed.Title,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan article: %w", err)
		}
		article.IsRead = isRead == 1
		article.Feed = &feed
		articles = append(articles, &article)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over articles: %w", err)
	}

	return articles, nil
}

// ReadArticles is the resolver for the readArticles field.
func (r *queryResolver) ReadArticles(ctx context.Context) ([]*model.Article, error) {
	rows, err := r.DB.Query(`
		SELECT a.id, a.feed_id, a.guid, a.title, a.url, a.is_read,
		       f.id, f.url, f.title
		FROM articles AS a
		INNER JOIN feeds AS f ON a.feed_id = f.id
		WHERE a.is_read = 1
		ORDER BY a.id DESC
		LIMIT 100
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to query read articles: %w", err)
	}
	defer rows.Close()

	var articles []*model.Article
	for rows.Next() {
		var article model.Article
		var feed model.Feed
		var isRead int
		err := rows.Scan(
			&article.ID, &article.FeedID, &article.GUID, &article.Title, &article.URL, &isRead,
			&feed.ID, &feed.URL, &feed.Title,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan article: %w", err)
		}
		article.IsRead = isRead == 1
		article.Feed = &feed
		articles = append(articles, &article)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over articles: %w", err)
	}

	return articles, nil
}

// Feed is the resolver for the feed field.
func (r *queryResolver) Feed(ctx context.Context, id string) (*model.Feed, error) {
	feedID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid feed ID: %w", err)
	}

	var feed model.Feed
	err = r.DB.QueryRow(
		"SELECT id, url, title, fetched_at FROM feeds WHERE id = ?",
		feedID,
	).Scan(&feed.ID, &feed.URL, &feed.Title, &feed.FetchedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("feed not found")
		}
		return nil, fmt.Errorf("failed to query feed: %w", err)
	}

	return &feed, nil
}

// Article is the resolver for the article field.
func (r *queryResolver) Article(ctx context.Context, id string) (*model.Article, error) {
	articleID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid article ID: %w", err)
	}

	var article model.Article
	var feed model.Feed
	var isRead int
	err = r.DB.QueryRow(`
		SELECT a.id, a.feed_id, a.guid, a.title, a.url, a.is_read,
		       f.id, f.url, f.title
		FROM articles AS a
		INNER JOIN feeds AS f ON a.feed_id = f.id
		WHERE a.id = ?
	`, articleID).Scan(
		&article.ID, &article.FeedID, &article.GUID, &article.Title, &article.URL, &isRead,
		&feed.ID, &feed.URL, &feed.Title,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("article not found")
		}
		return nil, fmt.Errorf("failed to query article: %w", err)
	}
	article.IsRead = isRead == 1
	article.Feed = &feed

	return &article, nil
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
