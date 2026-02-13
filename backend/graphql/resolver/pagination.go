package resolver

import (
	"context"
	"fmt"
	"strconv"

	"undef.ninja/x/feedaka/db"
	"undef.ninja/x/feedaka/graphql/model"
)

const defaultPageSize = 30
const maxPageSize = 100

// articleRow is a common interface for all paginated article query rows.
type articleRow struct {
	ID               int64
	FeedID           int64
	Guid             string
	Title            string
	Url              string
	IsRead           int64
	FeedID2          int64
	FeedUrl          string
	FeedTitle        string
	FeedIsSubscribed int64
}

func toArticleRow(r any) articleRow {
	switch v := r.(type) {
	case db.GetArticlesPaginatedRow:
		return articleRow{v.ID, v.FeedID, v.Guid, v.Title, v.Url, v.IsRead, v.FeedID2, v.FeedUrl, v.FeedTitle, v.FeedIsSubscribed}
	case db.GetArticlesPaginatedAfterRow:
		return articleRow{v.ID, v.FeedID, v.Guid, v.Title, v.Url, v.IsRead, v.FeedID2, v.FeedUrl, v.FeedTitle, v.FeedIsSubscribed}
	case db.GetArticlesByFeedPaginatedRow:
		return articleRow{v.ID, v.FeedID, v.Guid, v.Title, v.Url, v.IsRead, v.FeedID2, v.FeedUrl, v.FeedTitle, v.FeedIsSubscribed}
	case db.GetArticlesByFeedPaginatedAfterRow:
		return articleRow{v.ID, v.FeedID, v.Guid, v.Title, v.Url, v.IsRead, v.FeedID2, v.FeedUrl, v.FeedTitle, v.FeedIsSubscribed}
	default:
		panic("unexpected row type")
	}
}

func rowToArticle(row articleRow) *model.Article {
	return &model.Article{
		ID:     strconv.FormatInt(row.ID, 10),
		FeedID: strconv.FormatInt(row.FeedID, 10),
		GUID:   row.Guid,
		Title:  row.Title,
		URL:    row.Url,
		IsRead: row.IsRead == 1,
		Feed: &model.Feed{
			ID:           strconv.FormatInt(row.FeedID2, 10),
			URL:          row.FeedUrl,
			Title:        row.FeedTitle,
			IsSubscribed: row.FeedIsSubscribed == 1,
		},
	}
}

func (r *queryResolver) paginatedArticles(ctx context.Context, isRead int64, feedID *string, after *string, first *int32) (*model.ArticleConnection, error) {
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	limit := int64(defaultPageSize)
	if first != nil {
		limit = int64(*first)
		if limit <= 0 {
			limit = int64(defaultPageSize)
		}
		if limit > maxPageSize {
			limit = maxPageSize
		}
	}

	// Fetch limit+1 to determine hasNextPage
	fetchLimit := limit + 1

	var rawRows []any

	if feedID != nil {
		parsedFeedID, err := strconv.ParseInt(*feedID, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid feed ID: %w", err)
		}

		if after != nil {
			cursor, err := strconv.ParseInt(*after, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("invalid cursor: %w", err)
			}
			rows, err := r.Queries.GetArticlesByFeedPaginatedAfter(ctx, db.GetArticlesByFeedPaginatedAfterParams{
				IsRead: isRead,
				UserID: userID,
				FeedID: parsedFeedID,
				ID:     cursor,
				Limit:  fetchLimit,
			})
			if err != nil {
				return nil, fmt.Errorf("failed to query articles: %w", err)
			}
			for _, row := range rows {
				rawRows = append(rawRows, row)
			}
		} else {
			rows, err := r.Queries.GetArticlesByFeedPaginated(ctx, db.GetArticlesByFeedPaginatedParams{
				IsRead: isRead,
				UserID: userID,
				FeedID: parsedFeedID,
				Limit:  fetchLimit,
			})
			if err != nil {
				return nil, fmt.Errorf("failed to query articles: %w", err)
			}
			for _, row := range rows {
				rawRows = append(rawRows, row)
			}
		}
	} else {
		if after != nil {
			cursor, err := strconv.ParseInt(*after, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("invalid cursor: %w", err)
			}
			rows, err := r.Queries.GetArticlesPaginatedAfter(ctx, db.GetArticlesPaginatedAfterParams{
				IsRead: isRead,
				UserID: userID,
				ID:     cursor,
				Limit:  fetchLimit,
			})
			if err != nil {
				return nil, fmt.Errorf("failed to query articles: %w", err)
			}
			for _, row := range rows {
				rawRows = append(rawRows, row)
			}
		} else {
			rows, err := r.Queries.GetArticlesPaginated(ctx, db.GetArticlesPaginatedParams{
				IsRead: isRead,
				UserID: userID,
				Limit:  fetchLimit,
			})
			if err != nil {
				return nil, fmt.Errorf("failed to query articles: %w", err)
			}
			for _, row := range rows {
				rawRows = append(rawRows, row)
			}
		}
	}

	hasNextPage := int64(len(rawRows)) > limit
	if hasNextPage {
		rawRows = rawRows[:limit]
	}

	articles := make([]*model.Article, 0, len(rawRows))
	for _, raw := range rawRows {
		articles = append(articles, rowToArticle(toArticleRow(raw)))
	}

	var endCursor *string
	if len(articles) > 0 {
		lastID := articles[len(articles)-1].ID
		endCursor = &lastID
	}

	return &model.ArticleConnection{
		Articles: articles,
		PageInfo: &model.PageInfo{
			HasNextPage: hasNextPage,
			EndCursor:   endCursor,
		},
	}, nil
}
