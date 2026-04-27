package api

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	appcontext "undef.ninja/x/feedaka/context"
	"undef.ninja/x/feedaka/db"
	"undef.ninja/x/feedaka/feed"
)

func (h *Handler) FeedsListFeeds(ctx context.Context, _ FeedsListFeedsRequestObject) (FeedsListFeedsResponseObject, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return nil, fmt.Errorf("authentication required")
	}

	dbFeeds, err := h.Queries.GetFeeds(ctx, userID)
	if err != nil {
		return nil, err
	}

	unreadCounts, err := h.Queries.GetFeedUnreadCounts(ctx, userID)
	if err != nil {
		return nil, err
	}
	countMap := make(map[int64]int64, len(unreadCounts))
	for _, uc := range unreadCounts {
		countMap[uc.FeedID] = uc.UnreadCount
	}

	feeds := make(FeedsListFeeds200JSONResponse, 0, len(dbFeeds))
	for _, f := range dbFeeds {
		feeds = append(feeds, dbFeedToAPI(f, countMap[f.ID]))
	}

	return feeds, nil
}

func (h *Handler) FeedsAddFeed(ctx context.Context, request FeedsAddFeedRequestObject) (FeedsAddFeedResponseObject, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return nil, fmt.Errorf("authentication required")
	}

	result, err := feed.Fetch(ctx, request.Body.Url)
	if err != nil {
		return FeedsAddFeed400JSONResponse{Message: fmt.Sprintf("failed to parse feed: %v", err)}, nil
	}

	dbFeed, err := h.Queries.CreateFeed(ctx, db.CreateFeedParams{
		Url:       result.URL,
		Title:     result.Feed.Title,
		FetchedAt: time.Now().UTC().Format(time.RFC3339),
		UserID:    userID,
	})
	if err != nil {
		return FeedsAddFeed400JSONResponse{Message: fmt.Sprintf("failed to insert feed: %v", err)}, nil
	}

	if _, err := feed.Sync(ctx, h.Queries, dbFeed.ID, result.Feed); err != nil {
		return FeedsAddFeed400JSONResponse{Message: fmt.Sprintf("failed to sync articles: %v", err)}, nil
	}

	return FeedsAddFeed201JSONResponse(dbFeedToAPI(dbFeed, 0)), nil
}

func (h *Handler) FeedsGetFeed(ctx context.Context, request FeedsGetFeedRequestObject) (FeedsGetFeedResponseObject, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return nil, fmt.Errorf("authentication required")
	}

	feedID, err := strconv.ParseInt(request.FeedId, 10, 64)
	if err != nil {
		return FeedsGetFeed404JSONResponse{Message: "invalid feed ID"}, nil
	}

	dbFeed, err := h.Queries.GetFeed(ctx, feedID)
	if err != nil {
		if err == sql.ErrNoRows {
			return FeedsGetFeed404JSONResponse{Message: "feed not found"}, nil
		}
		return nil, err
	}

	if dbFeed.UserID != userID {
		return FeedsGetFeed404JSONResponse{Message: "feed not found"}, nil
	}

	return FeedsGetFeed200JSONResponse(dbFeedToAPI(dbFeed, 0)), nil
}

func (h *Handler) FeedsUnsubscribeFeed(ctx context.Context, request FeedsUnsubscribeFeedRequestObject) (FeedsUnsubscribeFeedResponseObject, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return nil, fmt.Errorf("authentication required")
	}

	feedID, err := strconv.ParseInt(request.FeedId, 10, 64)
	if err != nil {
		return FeedsUnsubscribeFeed404JSONResponse{Message: "invalid feed ID"}, nil
	}

	dbFeed, err := h.Queries.GetFeed(ctx, feedID)
	if err != nil {
		if err == sql.ErrNoRows {
			return FeedsUnsubscribeFeed404JSONResponse{Message: "feed not found"}, nil
		}
		return nil, err
	}

	if dbFeed.UserID != userID {
		return FeedsUnsubscribeFeed404JSONResponse{Message: "feed not found"}, nil
	}

	if err := h.Queries.UnsubscribeFeed(ctx, feedID); err != nil {
		return nil, err
	}

	return FeedsUnsubscribeFeed204Response{}, nil
}

func (h *Handler) FeedsMarkFeedRead(ctx context.Context, request FeedsMarkFeedReadRequestObject) (FeedsMarkFeedReadResponseObject, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return nil, fmt.Errorf("authentication required")
	}

	feedID, err := strconv.ParseInt(request.FeedId, 10, 64)
	if err != nil {
		return FeedsMarkFeedRead404JSONResponse{Message: "invalid feed ID"}, nil
	}

	dbFeed, err := h.Queries.GetFeed(ctx, feedID)
	if err != nil {
		if err == sql.ErrNoRows {
			return FeedsMarkFeedRead404JSONResponse{Message: "feed not found"}, nil
		}
		return nil, err
	}

	if dbFeed.UserID != userID {
		return FeedsMarkFeedRead404JSONResponse{Message: "feed not found"}, nil
	}

	if err := h.Queries.MarkFeedArticlesRead(ctx, feedID); err != nil {
		return nil, err
	}

	return FeedsMarkFeedRead200JSONResponse(dbFeedToAPI(dbFeed, 0)), nil
}

func (h *Handler) FeedsMarkFeedUnread(ctx context.Context, request FeedsMarkFeedUnreadRequestObject) (FeedsMarkFeedUnreadResponseObject, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return nil, fmt.Errorf("authentication required")
	}

	feedID, err := strconv.ParseInt(request.FeedId, 10, 64)
	if err != nil {
		return FeedsMarkFeedUnread404JSONResponse{Message: "invalid feed ID"}, nil
	}

	dbFeed, err := h.Queries.GetFeed(ctx, feedID)
	if err != nil {
		if err == sql.ErrNoRows {
			return FeedsMarkFeedUnread404JSONResponse{Message: "feed not found"}, nil
		}
		return nil, err
	}

	if dbFeed.UserID != userID {
		return FeedsMarkFeedUnread404JSONResponse{Message: "feed not found"}, nil
	}

	if err := h.Queries.MarkFeedArticlesUnread(ctx, feedID); err != nil {
		return nil, err
	}

	return FeedsMarkFeedUnread200JSONResponse(dbFeedToAPI(dbFeed, 0)), nil
}
