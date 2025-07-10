package graphql

// THIS CODE WILL BE UPDATED WITH SCHEMA CHANGES. PREVIOUS IMPLEMENTATION FOR SCHEMA CHANGES WILL BE KEPT IN THE COMMENT SECTION. IMPLEMENTATION FOR UNCHANGED SCHEMA WILL BE KEPT.

import (
	"context"

	"undef.ninja/x/feedaka/graphql/model"
)

type Resolver struct{}

// AddFeed is the resolver for the addFeed field.
func (r *mutationResolver) AddFeed(ctx context.Context, url string) (*model.Feed, error) {
	panic("not implemented")
}

// RemoveFeed is the resolver for the removeFeed field.
func (r *mutationResolver) RemoveFeed(ctx context.Context, id string) (bool, error) {
	panic("not implemented")
}

// MarkArticleRead is the resolver for the markArticleRead field.
func (r *mutationResolver) MarkArticleRead(ctx context.Context, id string) (*model.Article, error) {
	panic("not implemented")
}

// MarkArticleUnread is the resolver for the markArticleUnread field.
func (r *mutationResolver) MarkArticleUnread(ctx context.Context, id string) (*model.Article, error) {
	panic("not implemented")
}

// MarkFeedRead is the resolver for the markFeedRead field.
func (r *mutationResolver) MarkFeedRead(ctx context.Context, id string) (*model.Feed, error) {
	panic("not implemented")
}

// MarkFeedUnread is the resolver for the markFeedUnread field.
func (r *mutationResolver) MarkFeedUnread(ctx context.Context, id string) (*model.Feed, error) {
	panic("not implemented")
}

// Feeds is the resolver for the feeds field.
func (r *queryResolver) Feeds(ctx context.Context) ([]*model.Feed, error) {
	panic("not implemented")
}

// UnreadArticles is the resolver for the unreadArticles field.
func (r *queryResolver) UnreadArticles(ctx context.Context) ([]*model.Article, error) {
	panic("not implemented")
}

// ReadArticles is the resolver for the readArticles field.
func (r *queryResolver) ReadArticles(ctx context.Context) ([]*model.Article, error) {
	panic("not implemented")
}

// Feed is the resolver for the feed field.
func (r *queryResolver) Feed(ctx context.Context, id string) (*model.Feed, error) {
	panic("not implemented")
}

// Article is the resolver for the article field.
func (r *queryResolver) Article(ctx context.Context, id string) (*model.Article, error) {
	panic("not implemented")
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
