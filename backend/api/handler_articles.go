package api

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"

	appcontext "undef.ninja/x/feedaka/context"
	"undef.ninja/x/feedaka/db"
)

const defaultPageSize = 30
const maxPageSize = 100

func (h *Handler) ArticlesListUnreadArticles(ctx context.Context, request ArticlesListUnreadArticlesRequestObject) (ArticlesListUnreadArticlesResponseObject, error) {
	conn, err := h.paginatedArticles(ctx, 0, request.Params.FeedId, request.Params.After, request.Params.First)
	if err != nil {
		return nil, err
	}
	return ArticlesListUnreadArticles200JSONResponse(*conn), nil
}

func (h *Handler) ArticlesListReadArticles(ctx context.Context, request ArticlesListReadArticlesRequestObject) (ArticlesListReadArticlesResponseObject, error) {
	conn, err := h.paginatedArticles(ctx, 1, request.Params.FeedId, request.Params.After, request.Params.First)
	if err != nil {
		return nil, err
	}
	return ArticlesListReadArticles200JSONResponse(*conn), nil
}

func (h *Handler) ArticlesGetArticle(ctx context.Context, request ArticlesGetArticleRequestObject) (ArticlesGetArticleResponseObject, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return nil, fmt.Errorf("authentication required")
	}

	articleID, err := strconv.ParseInt(request.ArticleId, 10, 64)
	if err != nil {
		return ArticlesGetArticle404JSONResponse{Message: "invalid article ID"}, nil
	}

	row, err := h.Queries.GetArticle(ctx, articleID)
	if err != nil {
		if err == sql.ErrNoRows {
			return ArticlesGetArticle404JSONResponse{Message: "article not found"}, nil
		}
		return nil, err
	}

	f, err := h.Queries.GetFeed(ctx, row.FeedID)
	if err != nil {
		return nil, err
	}
	if f.UserID != userID {
		return ArticlesGetArticle404JSONResponse{Message: "article not found"}, nil
	}

	article := dbArticleToAPI(row)
	return ArticlesGetArticle200JSONResponse(article), nil
}

func (h *Handler) ArticlesMarkArticleRead(ctx context.Context, request ArticlesMarkArticleReadRequestObject) (ArticlesMarkArticleReadResponseObject, error) {
	article, err := h.updateArticleReadStatus(ctx, request.ArticleId, 1)
	if err != nil {
		return nil, err
	}
	if article == nil {
		return ArticlesMarkArticleRead404JSONResponse{Message: "article not found"}, nil
	}
	return ArticlesMarkArticleRead200JSONResponse(*article), nil
}

func (h *Handler) ArticlesMarkArticleUnread(ctx context.Context, request ArticlesMarkArticleUnreadRequestObject) (ArticlesMarkArticleUnreadResponseObject, error) {
	article, err := h.updateArticleReadStatus(ctx, request.ArticleId, 0)
	if err != nil {
		return nil, err
	}
	if article == nil {
		return ArticlesMarkArticleUnread404JSONResponse{Message: "article not found"}, nil
	}
	return ArticlesMarkArticleUnread200JSONResponse(*article), nil
}

func (h *Handler) updateArticleReadStatus(ctx context.Context, articleIdStr string, isRead int64) (*Article, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return nil, fmt.Errorf("authentication required")
	}

	articleID, err := strconv.ParseInt(articleIdStr, 10, 64)
	if err != nil {
		return nil, nil
	}

	article, err := h.Queries.GetArticle(ctx, articleID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	f, err := h.Queries.GetFeed(ctx, article.FeedID)
	if err != nil {
		return nil, err
	}
	if f.UserID != userID {
		return nil, nil
	}

	err = h.Queries.UpdateArticleReadStatus(ctx, db.UpdateArticleReadStatusParams{
		IsRead: isRead,
		ID:     article.ID,
	})
	if err != nil {
		return nil, err
	}

	// Re-fetch for updated state
	updated, err := h.Queries.GetArticle(ctx, articleID)
	if err != nil {
		return nil, err
	}

	result := dbArticleToAPI(updated)
	return &result, nil
}

func (h *Handler) paginatedArticles(ctx context.Context, isRead int64, feedID *string, after *string, first *int32) (*ArticleConnection, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return nil, fmt.Errorf("authentication required")
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
			rows, err := h.Queries.GetArticlesByFeedPaginatedAfter(ctx, db.GetArticlesByFeedPaginatedAfterParams{
				IsRead: isRead,
				UserID: userID,
				FeedID: parsedFeedID,
				ID:     cursor,
				Limit:  fetchLimit,
			})
			if err != nil {
				return nil, err
			}
			for _, row := range rows {
				rawRows = append(rawRows, row)
			}
		} else {
			rows, err := h.Queries.GetArticlesByFeedPaginated(ctx, db.GetArticlesByFeedPaginatedParams{
				IsRead: isRead,
				UserID: userID,
				FeedID: parsedFeedID,
				Limit:  fetchLimit,
			})
			if err != nil {
				return nil, err
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
			rows, err := h.Queries.GetArticlesPaginatedAfter(ctx, db.GetArticlesPaginatedAfterParams{
				IsRead: isRead,
				UserID: userID,
				ID:     cursor,
				Limit:  fetchLimit,
			})
			if err != nil {
				return nil, err
			}
			for _, row := range rows {
				rawRows = append(rawRows, row)
			}
		} else {
			rows, err := h.Queries.GetArticlesPaginated(ctx, db.GetArticlesPaginatedParams{
				IsRead: isRead,
				UserID: userID,
				Limit:  fetchLimit,
			})
			if err != nil {
				return nil, err
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

	articles := make([]Article, 0, len(rawRows))
	for _, raw := range rawRows {
		articles = append(articles, rowToArticle(toArticleRow(raw)))
	}

	var endCursor *string
	if len(articles) > 0 {
		lastID := articles[len(articles)-1].Id
		endCursor = &lastID
	}

	return &ArticleConnection{
		Articles: articles,
		PageInfo: PageInfo{
			HasNextPage: hasNextPage,
			EndCursor:   endCursor,
		},
	}, nil
}
