package context

import (
	"context"
)

type contextKey string

const userIDContextKey contextKey = "user_id"

// SetUserID adds the user ID to the context
func SetUserID(ctx context.Context, userID int64) context.Context {
	return context.WithValue(ctx, userIDContextKey, userID)
}

// GetUserID retrieves the user ID from the request context
func GetUserID(ctx context.Context) (int64, bool) {
	userID, ok := ctx.Value(userIDContextKey).(int64)
	return userID, ok
}
