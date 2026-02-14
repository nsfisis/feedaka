package api

import (
	"strconv"

	"undef.ninja/x/feedaka/db"
)

func dbFeedToAPI(f db.Feed, unreadCount int64) Feed {
	return Feed{
		Id:           strconv.FormatInt(f.ID, 10),
		Url:          f.Url,
		Title:        f.Title,
		FetchedAt:    f.FetchedAt,
		IsSubscribed: f.IsSubscribed == 1,
		UnreadCount:  int32(unreadCount),
	}
}

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

func rowToArticle(row articleRow) Article {
	return Article{
		Id:     strconv.FormatInt(row.ID, 10),
		FeedId: strconv.FormatInt(row.FeedID, 10),
		Guid:   row.Guid,
		Title:  row.Title,
		Url:    row.Url,
		IsRead: row.IsRead == 1,
		Feed: ArticleFeed{
			Id:           strconv.FormatInt(row.FeedID2, 10),
			Url:          row.FeedUrl,
			Title:        row.FeedTitle,
			IsSubscribed: row.FeedIsSubscribed == 1,
		},
	}
}

func dbArticleToAPI(row db.GetArticleRow) Article {
	return Article{
		Id:     strconv.FormatInt(row.ID, 10),
		FeedId: strconv.FormatInt(row.FeedID, 10),
		Guid:   row.Guid,
		Title:  row.Title,
		Url:    row.Url,
		IsRead: row.IsRead == 1,
		Feed: ArticleFeed{
			Id:    strconv.FormatInt(row.FeedID2, 10),
			Url:   row.FeedUrl,
			Title: row.FeedTitle,
		},
	}
}
