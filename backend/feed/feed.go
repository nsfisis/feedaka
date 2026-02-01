package feed

import (
	"context"
	"fmt"
	"time"

	"github.com/mmcdole/gofeed"

	"undef.ninja/x/feedaka/db"
)

func Fetch(ctx context.Context, url string) (*gofeed.Feed, error) {
	fp := gofeed.NewParser()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	feed, err := fp.ParseURLWithContext(url, ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch %s: %w", url, err)
	}
	return feed, nil
}

func Sync(ctx context.Context, queries *db.Queries, feedID int64, f *gofeed.Feed) error {
	err := queries.UpdateFeedMetadata(ctx, db.UpdateFeedMetadataParams{
		Title:     f.Title,
		FetchedAt: time.Now().UTC().Format(time.RFC3339),
		ID:        feedID,
	})
	if err != nil {
		return err
	}

	guids, err := queries.GetArticleGUIDsByFeed(ctx, feedID)
	if err != nil {
		return err
	}
	existingFeedGUIDs := make(map[string]bool, len(guids))
	for _, guid := range guids {
		existingFeedGUIDs[guid] = true
	}

	for _, item := range f.Items {
		if existingFeedGUIDs[item.GUID] {
			err := queries.UpdateArticle(ctx, db.UpdateArticleParams{
				Title:  item.Title,
				Url:    item.Link,
				FeedID: feedID,
				Guid:   item.GUID,
			})
			if err != nil {
				return err
			}
		} else {
			exists, err := queries.CheckArticleExistsByGUID(ctx, item.GUID)
			if err != nil {
				return err
			}
			if exists == 1 {
				continue
			}
			_, err = queries.CreateArticle(ctx, db.CreateArticleParams{
				FeedID: feedID,
				Guid:   item.GUID,
				Title:  item.Title,
				Url:    item.Link,
				IsRead: 0,
			})
			if err != nil {
				return err
			}
		}
	}
	return nil
}
