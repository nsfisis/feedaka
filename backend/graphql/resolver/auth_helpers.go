package resolver

import (
	"context"
	"errors"
	"fmt"

	"github.com/labstack/echo/v4"
	appcontext "undef.ninja/x/feedaka/context"
)

// getUserIDFromContext retrieves the authenticated user ID from context
// This is a wrapper around the GetUserID function from the context package
func getUserIDFromContext(ctx context.Context) (int64, error) {
	userID, ok := appcontext.GetUserID(ctx)
	if !ok {
		return 0, fmt.Errorf("authentication required")
	}
	return userID, nil
}

// Helper function to get Echo context from GraphQL context
func getEchoContext(ctx context.Context) (echo.Context, error) {
	echoCtx, ok := ctx.Value("echo").(echo.Context)
	if !ok {
		return nil, errors.New("echo context not found")
	}
	return echoCtx, nil
}
