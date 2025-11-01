package main

import (
	"github.com/labstack/echo/v4"
	"undef.ninja/x/feedaka/auth"
	appcontext "undef.ninja/x/feedaka/context"
)

// SessionAuthMiddleware validates session and adds user info to context
func SessionAuthMiddleware(sessionConfig *auth.SessionConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Try to get user ID from session
			userID, err := sessionConfig.GetUserID(c)
			if err == nil {
				// Add user ID to context
				ctx := appcontext.SetUserID(c.Request().Context(), userID)
				c.SetRequest(c.Request().WithContext(ctx))
			}
			// If no valid session, continue without authentication

			return next(c)
		}
	}
}
