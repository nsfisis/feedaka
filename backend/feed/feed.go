package feed

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/mmcdole/gofeed"

	"undef.ninja/x/feedaka/db"
)

// FetchResult holds the result of fetching a feed, including the resolved URL.
type FetchResult struct {
	Feed *gofeed.Feed
	URL  string
}

func Fetch(ctx context.Context, rawURL string) (*FetchResult, error) {
	fp := gofeed.NewParser()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	f, err := fp.ParseURLWithContext(rawURL, ctx)
	if err == nil {
		return &FetchResult{Feed: f, URL: rawURL}, nil
	}

	if !errors.Is(err, gofeed.ErrFeedTypeNotDetected) {
		return nil, fmt.Errorf("failed to fetch %s: %w", rawURL, err)
	}

	discoveredURL, discoverErr := discoverFeedURL(ctx, rawURL)
	if discoverErr != nil {
		return nil, fmt.Errorf("failed to fetch %s: not a feed and auto-discovery failed: %w", rawURL, discoverErr)
	}

	f, err = fp.ParseURLWithContext(discoveredURL, ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch discovered feed %s: %w", discoveredURL, err)
	}

	return &FetchResult{Feed: f, URL: discoveredURL}, nil
}

func discoverFeedURL(ctx context.Context, rawURL string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", rawURL, nil)
	if err != nil {
		return "", err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	base, err := url.Parse(rawURL)
	if err != nil {
		return "", err
	}

	links := discoverFeeds(resp.Body, base)
	feedURL := selectFeed(links)
	if feedURL == "" {
		return "", fmt.Errorf("no feed links found in HTML")
	}

	return feedURL, nil
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
